from sqlalchemy.orm import Session
from models.purchase import TransactionProcessing,Transaction,Purchase
import hmac
import hashlib
from datetime import datetime
def get_purchase(db: Session, purchase_id: int):
    return db.query(Purchase).filter(Purchase.id == purchase_id).first()

def get_transaction_processing_by_id(db: Session, transaction_id: str):
    return db.query(TransactionProcessing).filter(TransactionProcessing.transaction_id == transaction_id).first()


def create_transaction_processing(db:Session,data):
  db_transaction = TransactionProcessing(**data)
  db.add(db_transaction)
  db.commit()
  db.refresh(db_transaction)
  return db_transaction

def delete_transaction_processing_by_id(db:Session,transaction_id:str):
  db_transaction = get_transaction_processing_by_id(db,transaction_id)
  if not db_transaction:
    return None
  db.delete(db_transaction)
  db.commit()
  return db_transaction

def verify_razorpay_signature(payload: bytes, received_signature: str, secret: str) -> bool:
    generated_signature = hmac.new(
        key=bytes(secret, "utf-8"),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(generated_signature, received_signature)

def create_purchase(db: Session, db_transaction_processing: TransactionProcessing, commit=True):
    purchase = Purchase(
        purchased_user_id=db_transaction_processing.user_id,
        course_id=db_transaction_processing.item_id,
        affiliate_user_id=db_transaction_processing.affiliate_user_id
    )
    db.add(purchase)
    if commit:
        db.commit()
        db.refresh(purchase)
    return purchase


def create_transaction(db: Session, transaction_id: str, db_purchase: Purchase, txn_data: dict, commit=True):
    transaction = Transaction(
        purchase_id=db_purchase.id,
        transaction_id=transaction_id,
        status=txn_data.get("status"),
        provider="razorpay",
        utr_id=txn_data.get("acquirer_data", {}).get("rrn"),
        method=txn_data.get("method"),
        vpa=txn_data.get("upi", {}).get("vpa"),
        email=txn_data.get("email"),
        contact=txn_data.get("contact"),
        currency=txn_data.get("currency"),
        amount=txn_data.get("amount"),
        base_amount=txn_data.get("base_amount"),
        fee=txn_data.get("fee"),
        tax=txn_data.get("tax"),
        error_code=txn_data.get("error_code"),
        error_description=txn_data.get("error_description"),
        created_at=datetime.utcnow()
    )
    db.add(transaction)
    if commit:
        db.commit()
        db.refresh(transaction)
    return transaction

def update_purchase(db: Session, purchase_id: int, updates: dict):
    purchase = get_purchase(db, purchase_id)
    if not purchase:
        return None
    for key, value in updates.items():
        setattr(purchase, key, value)
    db.commit()
    db.refresh(purchase)
    return purchase


def delete_purchase(db: Session, purchase_id: int):
    purchase = get_purchase(db, purchase_id)
    if not purchase:
        return None
    db.delete(purchase)
    db.commit()
    return purchase