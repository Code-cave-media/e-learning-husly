from sqlalchemy import Column, Integer, String, ForeignKey
from db.base import Base

class AffiliateAccount(Base):
    __tablename__ = "affiliate_account"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    balance = Column(Integer)

class Withdraw(Base):
    __tablename__ = "withdraw"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    amount = Column(Integer)
    status = Column(String)
    explanation = Column(String)
    account_details = Column(String)

class BankDetails(Base):
    __tablename__ = "bank_details"
    id = Column(Integer, ForeignKey("affiliate_account.id"), primary_key=True)
    account_id = Column(Integer)
    bank_name = Column(String)
    account_number = Column(Integer)
    ifsc_code = Column(String)
    account_name = Column(String)

class UPIDetails(Base):
    __tablename__ = "upi_details"
    id = Column(Integer, ForeignKey("affiliate_account.id"), primary_key=True)
    account_id = Column(Integer)
    upiId = Column(Integer)
