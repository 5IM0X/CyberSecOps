import uuid
from datetime import datetime

from pydantic import BaseModel


class AssetCreate(BaseModel):
    type: str
    value: str
    environment: str = "lab"
    owner: str | None = None


class AssetResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    type: str
    value: str
    environment: str
    owner: str | None
    created_at: datetime

    class Config:
        from_attributes = True
