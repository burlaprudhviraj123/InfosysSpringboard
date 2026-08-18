import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

from app.main import app
from app.db.session import Base, get_db
from app.models.user import User, UserRole
from app.models.waste import WasteBatch
from app.core import security

# Use an in-memory SQLite database for isolated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db_session):
    user = User(
        username="Test Admin",
        email="admin_test@textilewaste.ai",
        hashed_password=security.get_password_hash("adminpass123"),
        role=UserRole.ADMIN,
        organization_name="TexWaste HQ"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def operator_user(db_session):
    user = User(
        username="Test Operator",
        email="operator_test@textilewaste.ai",
        hashed_password=security.get_password_hash("operatorpass123"),
        role=UserRole.OPERATOR,
        organization_name="Recovery Facility 1"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def manager_user(db_session):
    user = User(
        username="Test Manager",
        email="manager_test@textilewaste.ai",
        hashed_password=security.get_password_hash("managerpass123"),
        role=UserRole.MANAGER,
        organization_name="Global ESG Advisory"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def admin_token(admin_user):
    return security.create_access_token(admin_user.username)

@pytest.fixture
def operator_token(operator_user):
    return security.create_access_token(operator_user.username)

@pytest.fixture
def manager_token(manager_user):
    return security.create_access_token(manager_user.username)

@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}

@pytest.fixture
def operator_headers(operator_token):
    return {"Authorization": f"Bearer {operator_token}"}

@pytest.fixture
def manager_headers(manager_token):
    return {"Authorization": f"Bearer {manager_token}"}
