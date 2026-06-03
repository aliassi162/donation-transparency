from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import User
from app.security import hash_password


def seed_admin(db: Session) -> None:
    settings = get_settings()
    existing = db.query(User).filter(User.email == settings.admin_email).first()
    if existing:
        existing.password_hash = hash_password(settings.admin_password)
        existing.role = "admin"
        db.commit()
        return
    db.add(User(email=settings.admin_email, password_hash=hash_password(settings.admin_password), role="admin"))
    db.commit()
