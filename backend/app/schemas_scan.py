import uuid
from datetime import datetime

from pydantic import BaseModel


class ScanCreate(BaseModel):
    asset_id: uuid.UUID
    scanner: str = "nmap"


class ScanResponse(BaseModel):
    id: uuid.UUID
    asset_id: uuid.UUID
    scanner: str
    status: str
    started_at: datetime | None
    finished_at: datetime | None
    error_message: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class FindingResponse(BaseModel):
    id: uuid.UUID
    scan_id: uuid.UUID
    title: str
    severity: str
    cvss: float | None
    evidence: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
