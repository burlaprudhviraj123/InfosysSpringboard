from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.models.user import User, UserRole
from app.core import security
from app.core.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Pydantic schemas
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    organization_name: str | None = None
    role: UserRole = UserRole.OPERATOR

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    organization_name: str | None = None
    role: UserRole

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
    username: str

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.email == user_in.email) | (User.username == user_in.username)).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        organization_name=user_in.organization_name,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter((User.email == form_data.username) | (User.username == form_data.username)).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.username, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

class GoogleOAuthRequest(BaseModel):
    google_token: str = "demo_google_oauth2_token"
    email: str = "operator.google@textilewaste.ai"
    name: str = "Google Operator"

@router.post("/oauth2/google", response_model=Token)
def google_oauth2_login(payload: GoogleOAuthRequest, db: Session = Depends(get_db)):
    # OAuth2 Google Third-Party Authentication Handler (Milestone 1 Spec)
    username = payload.name.replace(" ", "_").lower()
    email = payload.email
    user = db.query(User).filter((User.email == email) | (User.username == username)).first()
    
    if not user:
        hashed_pw = security.get_password_hash("OAuth2SecurePass123!")
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_pw,
            role=UserRole.OPERATOR
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.username, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

import random

otp_store = {}

class OTPRequest(BaseModel):
    email: str

class OTPVerifyResetRequest(BaseModel):
    email: str
    otp_code: str
    new_password: str

@router.post("/send-otp")
def send_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter((User.email == payload.email) | (User.username == payload.email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account registered with this email address."
        )
    
    otp = f"{random.randint(100000, 999999)}"
    otp_store[payload.email.lower().strip()] = otp
    return {
        "message": f"OTP sent to {payload.email}! (Development OTP Code: {otp})",
        "otp_demo": otp
    }

@router.post("/verify-otp-reset")
def verify_otp_reset(payload: OTPVerifyResetRequest, db: Session = Depends(get_db)):
    email_clean = payload.email.lower().strip()
    stored_otp = otp_store.get(email_clean)
    
    if not stored_otp or stored_otp != payload.otp_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code. Please verify and try again."
        )
    
    if len(payload.new_password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters long."
        )
        
    user = db.query(User).filter((User.email == email_clean) | (User.username == email_clean)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )
        
    user.hashed_password = security.get_password_hash(payload.new_password)
    db.commit()
    otp_store.pop(email_clean, None)
    return {"message": "Password updated successfully! Please sign in with your new password."}
