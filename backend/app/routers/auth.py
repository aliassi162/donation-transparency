from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, Token, UserOut
from app.security import create_access_token, get_current_admin, verify_password


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = db.query(User).filter(User.email == payload.email, User.role == "admin").first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return Token(access_token=create_access_token(user.email))


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"message": "Discard the bearer token on the client."}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_admin)) -> User:
    return user
