import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Asset, Membership, User
from app.schemas_asset import AssetCreate, AssetResponse
from app.routers_auth import get_current_user

router = APIRouter(prefix="/assets", tags=["assets"])


def get_user_org_id(user: User, db: Session) -> uuid.UUID:
    membership = db.query(Membership).filter(Membership.user_id == user.id).first()
    if not membership:
        raise HTTPException(status_code=403, detail="User has no organization membership")
    return membership.organization_id


@router.post("", response_model=AssetResponse, status_code=201)
def create_asset(
    payload: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = get_user_org_id(current_user, db)
    asset = Asset(organization_id=org_id, **payload.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.get("", response_model=list[AssetResponse])
def list_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = get_user_org_id(current_user, db)
    return db.query(Asset).filter(Asset.organization_id == org_id).all()


@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org_id = get_user_org_id(current_user, db)
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.organization_id == org_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset
