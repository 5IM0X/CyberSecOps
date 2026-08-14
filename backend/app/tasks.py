import subprocess
import tempfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Scan, Finding, Asset


def now_utc():
    return datetime.now(timezone.utc)


def parse_nmap_xml(xml_path: str) -> list[dict]:
    """Extract open ports/services as normalized findings from an Nmap XML report."""
    findings = []
    tree = ET.parse(xml_path)
    root = tree.getroot()

    for host in root.findall("host"):
        for port in host.findall(".//port"):
            state = port.find("state")
            if state is None or state.get("state") != "open":
                continue
            service = port.find("service")
            service_name = service.get("name") if service is not None else "unknown"
            product = service.get("product", "") if service is not None else ""
            version = service.get("version", "") if service is not None else ""
            port_id = port.get("portid")
            protocol = port.get("protocol")

            title = f"Open port {port_id}/{protocol} ({service_name})"
            evidence = f"service={service_name} product={product} version={version}".strip()

            findings.append({
                "title": title,
                "severity": "info",
                "evidence": evidence,
            })

    return findings


@celery_app.task(name="run_nmap_scan")
def run_nmap_scan(scan_id: str):
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return

        scan.status = "running"
        scan.started_at = now_utc()
        db.commit()

        asset = db.query(Asset).filter(Asset.id == scan.asset_id).first()

        with tempfile.NamedTemporaryFile(suffix=".xml", delete=False) as tmp:
            xml_path = tmp.name

        try:
            # LAB TARGETS ONLY. -sV: version detection, -Pn: skip host discovery ping.
            subprocess.run(
                ["nmap", "-sV", "-Pn", asset.value, "-oX", xml_path],
                check=True,
                timeout=300,
                capture_output=True,
            )

            findings_data = parse_nmap_xml(xml_path)

            for f in findings_data:
                existing = (
                    db.query(Finding)
                    .join(Scan)
                    .filter(Scan.asset_id == scan.asset_id, Finding.title == f["title"], Finding.status == "open")
                    .first()
                )
                if existing:
                    continue
                finding = Finding(scan_id=scan.id, **f)
                db.add(finding)

            scan.status = "completed"
            scan.finished_at = now_utc()
            db.commit()

        except subprocess.CalledProcessError as e:
            scan.status = "failed"
            scan.error_message = f"nmap exited with error: {e.stderr}"
            scan.finished_at = now_utc()
            db.commit()
        except subprocess.TimeoutExpired:
            scan.status = "failed"
            scan.error_message = "nmap timed out after 300s"
            scan.finished_at = now_utc()
            db.commit()

    finally:
        db.close()
