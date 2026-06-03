from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.routers import admin, auth, public
from app.seed import seed_admin


def create_app() -> FastAPI:
    settings = get_settings()
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_columns()
    with SessionLocal() as db:
        seed_admin(db)

    app = FastAPI(title="Donation Transparency API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(public.router)
    app.include_router(auth.router)
    app.include_router(admin.router)
    return app


def ensure_sqlite_columns() -> None:
    if not engine.url.get_backend_name().startswith("sqlite"):
        return
    inspector = inspect(engine)
    table_columns = {
        table: {column["name"] for column in inspector.get_columns(table)}
        for table in ("donations_received", "households")
    }
    with engine.begin() as connection:
        if "donor_country" not in table_columns["donations_received"]:
            connection.execute(text("ALTER TABLE donations_received ADD COLUMN donor_country VARCHAR(100)"))
        if "location" not in table_columns["households"]:
            connection.execute(text("ALTER TABLE households ADD COLUMN location VARCHAR(255)"))


app = create_app()
