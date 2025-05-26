from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, DateTime
from db.base import Base
from .utils import TimestampMixin
from datetime import datetime

class Purchase(Base):
    __tablename__ = "purchase"
    id = Column(Integer, primary_key=True, index=True)
    purchased_user_id = Column(Integer, ForeignKey("user.id"))
    item_id = Column(Integer, ForeignKey("course.id"))
    item_type = Column(String)
    affiliate_user_id = Column(Integer, ForeignKey("user.id"),nullable=True)

class Transaction(TimestampMixin,Base):
    __tablename__ = "transaction"
    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchase.id"))
    transaction_id = Column(String, unique=True)  # Razorpay payment ID
    order_id = Column(String)                     # Razorpay order ID
    status = Column(String)                       # e.g., 'captured', 'failed'
    provider = Column(String)                     # e.g., 'razorpay'
    utr_id = Column(String)                       # UPI transaction ID / RRN
    method = Column(String)                       # 'upi', 'card', 'wallet'
    vpa = Column(String, nullable=True)           # if UPI
    email = Column(String)
    contact = Column(String)
    currency = Column(String)
    amount = Column(Integer)                      # in paise
    base_amount = Column(Integer)
    fee = Column(Integer, nullable=True)
    tax = Column(Integer, nullable=True)
    error_code = Column(String, nullable=True)
    error_description = Column(String, nullable=True)

class TransactionProcessing(TimestampMixin, Base):  
    __tablename__ = "transaction_processing"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True)
    item_id =  Column(Integer)
    item_type = Column(String)
    affiliate_user_id = Column(String)
    user_id = Column(Integer)
    is_new_user = Column(Boolean)
    amount = Column(String)
    discount = Column(String)
    coupon_code = Column(String)
    coupon_type = Column(String)