from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core_config import settings
from app.routers_auth import router as auth_router, get_current_user
from app.routers_assets import router as assets_router
from app.routers_scans import router as scans_router
from app.schemas import UserResponse
from app.models import User

app = FastAPI(title="CyberSecOps Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(assets_router)
app.include_router(scans_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
