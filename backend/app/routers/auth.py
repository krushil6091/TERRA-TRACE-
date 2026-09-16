from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/auth", tags=["Offline Authentication"])


class AdminUser(BaseModel):
    id: str
    username: str
    full_name: str
    badge_id: str
    role: str
    organization: str
    is_authenticated: bool


class LoginRequest(BaseModel):
    username: str
    password: str


# Offline default local admin credentials
LOCAL_ADMIN = AdminUser(
    id="adm-001",
    username="investigator",
    full_name="Lead Forensic Auditor",
    badge_id="EXAM-SEC-7749",
    role="Lead Forensic Auditor",
    organization="Exam Integrity & Audit Bureau (Offline Enclave)",
    is_authenticated=True
)


@router.post("/login", response_model=AdminUser)
async def login(credentials: LoginRequest):
    """
    Offline local authentication for the on-premise single-admin profile.
    """
    # Accept standard default or local credentials
    if credentials.username.strip() and len(credentials.password) >= 4:
        return AdminUser(
            id="adm-001",
            username=credentials.username,
            full_name=credentials.username.title() if credentials.username != "investigator" else "Lead Forensic Auditor",
            badge_id="EXAM-SEC-7749",
            role="Lead Forensic Auditor",
            organization="Exam Integrity & Audit Bureau (Offline Enclave)",
            is_authenticated=True
        )
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid local credentials. Password must be at least 4 characters."
    )


@router.get("/session", response_model=AdminUser)
async def get_session():
    """
    Returns current active local offline admin profile.
    """
    return LOCAL_ADMIN
