from sqlalchemy import Column, Integer, String,Boolean
from sqlalchemy.orm import relationship
from db.base import Base

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone  = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    user_id = Column(String, unique=True, nullable=False)
    is_admin = Column(Boolean,default=False)
    purchases = relationship('Purchase',foreign_keys="Purchase.purchased_user_id",backref="purchaser")
    affiliate_purchases = relationship('Purchase', foreign_keys="Purchase.affiliate_user_id",backref="affiliate_user")
class TempUser(Base):
    __tablename__ = "temp_user"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
