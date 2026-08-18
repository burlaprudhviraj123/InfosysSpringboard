import pytest
from datetime import timedelta
from app.core import security
from app.models.user import User, UserRole

def test_password_hashing():
    pwd = "securepassword123"
    hashed = security.get_password_hash(pwd)
    assert hashed != pwd
    assert security.verify_password(pwd, hashed) is True
    assert security.verify_password("wrongpassword", hashed) is False

def test_jwt_token_creation_and_validation():
    subject = "tester123"
    token = security.create_access_token(subject, expires_delta=timedelta(minutes=15))
    payload = security.decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == subject

def test_jwt_token_expiration():
    subject = "expired_user"
    token = security.create_access_token(subject, expires_delta=timedelta(seconds=-1))
    payload = security.decode_access_token(token)
    assert payload is None

def test_user_registration_and_login(client):
    reg_payload = {
        "username": "New Analyst",
        "email": "analyst@textilewaste.ai",
        "password": "validpassword123",
        "role": "Sustainability Manager",
        "organization_name": "EcoCorp"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    assert reg_data["email"] == "analyst@textilewaste.ai"
    assert reg_data["username"] == "New Analyst"

    # Test login with form data
    login_res = client.post("/api/auth/login", data={
        "username": "New Analyst",
        "password": "validpassword123"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

def test_login_invalid_password(client, operator_user):
    res = client.post("/api/auth/login", data={
        "username": operator_user.username,
        "password": "incorrect_password"
    })
    assert res.status_code == 400

def test_unauthorized_access(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401

def test_invalid_token_access(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer completely.invalid.token"})
    assert res.status_code == 401

def test_admin_rbac_protection(client, operator_headers, admin_headers):
    # Non-admin attempting to fetch user directory
    op_res = client.get("/api/auth/users", headers=operator_headers)
    assert op_res.status_code == 403

    # Admin accessing user directory
    admin_res = client.get("/api/auth/users", headers=admin_headers)
    assert admin_res.status_code == 200
    users = admin_res.json()
    assert isinstance(users, list)
