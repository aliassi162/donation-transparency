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
    ensure_required_columns()
    with SessionLocal() as db:
        seed_admin(db)

    app = FastAPI(title="Donation Transparency API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_origin_regex=settings.cors_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(public.router)
    app.include_router(auth.router)
    app.include_router(admin.router)
    return app


def ensure_required_columns() -> None:
    inspector = inspect(engine)
    table_columns = {
        table: {column["name"] for column in inspector.get_columns(table)}
        for table in ("donations_received", "households", "distributions")
    }
    with engine.begin() as connection:
        if "donor_country" not in table_columns["donations_received"]:
            connection.execute(text("ALTER TABLE donations_received ADD COLUMN donor_country VARCHAR(100)"))
        if "location" not in table_columns["households"]:
            connection.execute(text("ALTER TABLE households ADD COLUMN location VARCHAR(255)"))
        if "distribution_code" not in table_columns["distributions"]:
            connection.execute(text("ALTER TABLE distributions ADD COLUMN distribution_code VARCHAR(100)"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_distributions_distribution_code ON distributions (distribution_code)"))


app = create_app()
