import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Scan, Finding, Asset, User
from app.schemas_scan import ScanCreate, ScanResponse, FindingResponse
from app.routers_auth import get_current_user
from app.routers_assets import get_user_org_id
from app.tasks import run_nmap_scan

router = APIRouter(tags=["scans"])


@router.post("/scans", response_model=ScanResponse, status_code=201)
def create_scan(
    payload: ScanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = get_user_org_id(current_user, db)
    asset = db.query(Asset).filter(Asset.id == payload.asset_id, Asset.organization_id == org_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    scan = Scan(asset_id=asset.id, scanner=payload.scanner, status="queued")
    db.add(scan)
    db.commit()
    db.refresh(scan)

    if payload.scanner == "nmap":
        run_nmap_scan.delay(str(scan.id))
    else:
        raise HTTPException(status_code=400, detail=f"Scanner '{payload.scanner}' not supported yet")

    return scan


@router.get("/scans/{scan_id}", response_model=ScanResponse)
def get_scan(
    scan_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = get_user_org_id(current_user, db)
    scan = (
        db.query(Scan)
        .join(Asset)
        .filter(Scan.id == scan_id, Asset.organization_id == org_id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/findings", response_model=list[FindingResponse])
def list_findings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = get_user_org_id(current_user, db)
    return (
        db.query(Finding)
        .join(Scan)
        .join(Asset)
        .filter(Asset.organization_id == org_id)
        .all()
    )
