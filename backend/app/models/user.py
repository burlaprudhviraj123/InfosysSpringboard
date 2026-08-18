import enum
from sqlalchemy import Column, Integer, String, Enum, Boolean
from app.db.session import Base

class UserRole(str, enum.Enum):
    OPERATOR = "Recycling Facility Operator"
    MANAGER = "Sustainability Manager"
    MANUFACTURER = "Textile Manufacturer"
    ADMIN = "Administrator"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    organization_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.OPERATOR, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
