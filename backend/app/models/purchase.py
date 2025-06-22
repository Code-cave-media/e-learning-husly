from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, DateTime
from db.base import Base
from .utils import TimestampMixin
from datetime import datetime
from sqlalchemy.orm import relationship
class Transaction(TimestampMixin,Base):
    __tablename__ = "transaction"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String)      
    status = Column(String)                       # e.g., 'captured', 'failed'
    provider = Column(String)                     # e.g., 'razorpay'
    utr_id = Column(String)                       # UPI transaction ID / RRN
    method = Column(String)                       # 'upi', 'card', 'wallet'
    vpa = Column(String, nullable=True)           
    email = Column(String)
    contact = Column(String)
    currency = Column(String)
    amount = Column(Integer)                        
    base_amount = Column(Integer)
    fee = Column(Integer, nullable=True)
    tax = Column(Integer, nullable=True)
    error_code = Column(String, nullable=True)
    error_description = Column(String, nullable=True)
    item_id = Column(Integer, nullable=True)         # ID of the purchased item
    item_type = Column(String, nullable=True)        # Type of the purchased item
    purchase = relationship("Purchase", back_populates="transaction", uselist=False)



class Purchase(TimestampMixin,Base):
    __tablename__ = "purchase"
    id = Column(Integer, primary_key=True, index=True)
    purchased_user_id = Column(Integer, ForeignKey("user.id"),nullable=True)
    
    item_id = Column(Integer)
    item_type = Column(String)
    affiliate_user_id = Column(Integer, ForeignKey("user.id"),nullable=True)
    transaction_id = Column(Integer, ForeignKey("transaction.id"),nullable=True) 
    user = relationship("User", foreign_keys=[purchased_user_id], back_populates="purchases")
    affiliate_user = relationship("User", foreign_keys=[affiliate_user_id], back_populates="affiliate_purchases")
    transaction = relationship("Transaction", foreign_keys=[transaction_id], back_populates="purchase")
    amount = Column(Float,nullable=True)
    discount = Column(Float,nullable=True)
    coupon_code = Column(String,nullable=True)
    coupon_type = Column(String,nullable=True)




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