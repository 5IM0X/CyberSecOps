import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AssetCreate(BaseModel):
    type: Literal["ip", "domain", "url"]
    value: str = Field(min_length=1, max_length=255)
    environment: Literal["lab", "staging", "prod"] = "lab"
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
