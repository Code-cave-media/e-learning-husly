from sqlalchemy import Column, Integer, String, ForeignKey
from db.base import Base

class Purchase(Base):
    __tablename__ = "purchase"
    id = Column(Integer, primary_key=True, index=True)
    purchased_user_id = Column(Integer, ForeignKey("user.id"))
    course_id = Column(Integer, ForeignKey("course.id"))
    affiliate_user_id = Column(Integer, ForeignKey("user.id"))

class Transaction(Base):
    __tablename__ = "transaction"
    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchase.id"))
    status = Column(String)
    provider = Column(String)
    transaction_id = Column(Integer)
