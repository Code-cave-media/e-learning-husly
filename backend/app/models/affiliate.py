from sqlalchemy import Column, Integer, String, ForeignKey
from db.base import Base
from models.utils import TimestampMixin,CreatedAtMixin
from sqlalchemy.orm import relationship
class AffiliateAccount(Base):
    __tablename__ = "affiliate_account"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    balance = Column(Integer)
    total_earnings = Column(Integer,default=0)

class Withdraw(TimestampMixin,Base):
    __tablename__ = "withdraw"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    amount = Column(Integer)
    status = Column(String)
    explanation = Column(String)
    account_details = Column(String)

class BankDetails(Base):
    __tablename__ = "bank_details"
    id = Column(Integer,  primary_key=True)
    account_id = Column(Integer)
    bank_name = Column(String)
    account_number = Column(String)
    ifsc_code = Column(String)
    account_name = Column(String)

class UPIDetails(Base):
    __tablename__ = "upi_details"
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer)
    upiId = Column(String)

class AffiliateLinkClick(CreatedAtMixin,Base):
    __tablename__ = "affiliate_link_click"
    id = Column(Integer, primary_key=True)
    link_id = Column(Integer, ForeignKey("affiliate_link.id", ondelete="CASCADE"))
    affiliate_link = relationship("AffiliateLink", back_populates="clicks")

class AffiliateLinkPurchase(CreatedAtMixin,Base):
    __tablename__ = "affiliate_link_purchase"
    id = Column(Integer, primary_key=True)
    link_id = Column(Integer, ForeignKey("affiliate_link.id", ondelete="CASCADE"))
    affiliate_link = relationship("AffiliateLink", back_populates="purchases")
    amount = Column(Integer)

class AffiliateLink(TimestampMixin,Base):
    __tablename__ = "affiliate_link"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    item_id = Column(Integer)
    item_type = Column(String)
    clicks = relationship("AffiliateLinkClick",back_populates='affiliate_link',cascade="all, delete-orphan")
    purchases = relationship("AffiliateLinkPurchase", back_populates="affiliate_link", cascade="all, delete-orphan")
