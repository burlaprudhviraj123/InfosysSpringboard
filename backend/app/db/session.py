import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    # If a relative SQLite path is passed, resolve it to the backend root directory
    if db_url.startswith("sqlite:///."):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        db_filename = db_url.replace("sqlite:///./", "").replace("sqlite:///", "")
        db_path = os.path.join(backend_dir, db_filename)
        db_url = f"sqlite:///{db_path}"
    engine = create_engine(
        db_url, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
