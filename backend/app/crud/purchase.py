from sqlalchemy.orm import Session
from models.purchase import TransactionProcessing,Transaction,Purchase
import hmac
import hashlib
from datetime import datetime
from crud.utils import to_pagination_response
from schemas.purchase import TransactionResponse,PurchaseResponse,ListTransactionResponse
from sqlalchemy import or_
from models.user import User
from schemas.ebook import EBookResponse
from schemas.course import CourseResponse
import json
def get_purchase(db: Session, purchase_id: int):
    return db.query(Purchase).filter(Purchase.id == purchase_id).first()

def get_transaction_processing_by_id(db: Session, transaction_id: str):
    return db.query(TransactionProcessing).filter(TransactionProcessing.transaction_id == transaction_id).first()

def get_transaction_by_transaction_id(db: Session, transaction_id: str):
    return db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()

def get_purchase_by_id(db: Session, purchase_id: int):
    return db.query(Purchase).filter(Purchase.id == purchase_id).first()

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

def create_purchase(db: Session, data: dict, commit=True):
    create_data = {
        'purchased_user_id':data.user_id if data.user_id else None,
        'item_id':data.item_id,
        'item_type':data.item_type,
        'affiliate_user_id':data.affiliate_user_id if data.affiliate_user_id else None,
        "amount": data.amount if hasattr(data, 'amount') else None,
        "discount": data.discount if hasattr(data, 'discount') else None,
        "coupon_code": data.coupon_code if hasattr(data, 'coupon_code') else None,
        "coupon_type":data.coupon_type if hasattr(data, 'coupon_type') else None,
    }
    purchase = Purchase(**create_data)
    db.add(purchase)
    if commit:
        db.commit()
        db.refresh(purchase)
    return purchase

def create_razorpay_transaction(db: Session, transaction_id: str, db_purchase: Purchase | None, txn_data: dict, commit=True):
    transaction = Transaction(
        purchase_id=db_purchase.id if db_purchase else None,
        transaction_id=transaction_id,
        order_id=txn_data.get("order_id"),  # Make sure to save order_id
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

def create_cashfree_transaction(
    db: Session,
    transaction_id: str,
    txn_data: dict,
    customer_info :dict,
    provider: str = "cashfree",
    item_id: int | None = None,
    item_type: str | None = None,
    commit: bool = True
):
    # Detect method from nested payment_method
    raw_method_data = txn_data.get("payment_method", {})  # e.g., {'upi': {...}}
    method = list(raw_method_data.keys())[0] if isinstance(raw_method_data, dict) and raw_method_data else None

    # Extract VPA (only relevant if UPI is used)
    vpa = None
    if "upi" in raw_method_data:
        vpa = raw_method_data["upi"].get("upi_id") or raw_method_data["upi"].get("vpa")

    transaction = Transaction(
        transaction_id=transaction_id,
        status=txn_data.get("status") or txn_data.get("payment_status"),
        provider=provider,
        utr_id=txn_data.get("bank_reference",None),
        method=method,
        vpa=vpa,
        email=customer_info.get("customer_email"),
        contact=customer_info.get("customer_phone"),
        currency=txn_data.get("payment_currency"),
        amount=txn_data.get("payment_amount"),
        base_amount=txn_data.get("base_amount"),
        fee=txn_data.get("payment_charge"),  # Cashfree-specific field
        tax=txn_data.get("tax"),
        error_code=txn_data.get("error_code"),
        error_description=txn_data.get("error_description"),
        created_at=datetime.utcnow(),
        item_id=item_id,
        item_type=item_type
    )

    db.add(transaction)
    if commit:
        db.commit()
        db.refresh(transaction)

    return transaction

def update_cashfree_transaction(
    db: Session,
    db_transaction: Transaction,
    txn_data: dict,
    provider: str = "cashfree",
    commit: bool = True
):
    # Get method like 'upi', 'card', etc.
    raw_method_data = txn_data.get("payment_method", {})
    method = list(raw_method_data.keys())[0] if isinstance(raw_method_data, dict) and raw_method_data else None

    # Extract VPA if payment method is UPI
    vpa = None
    if "upi" in raw_method_data:
        vpa = raw_method_data["upi"].get("upi_id") or raw_method_data["upi"].get("vpa")

    db_transaction.status = txn_data.get("status") or txn_data.get("payment_status")
    db_transaction.provider = provider
    db_transaction.utr_id =  txn_data.get("bank_reference",None)
    db_transaction.method = method
    db_transaction.vpa = vpa
    db_transaction.currency = txn_data.get("payment_currency")
    db_transaction.amount = txn_data.get("payment_amount")
    db_transaction.base_amount = txn_data.get("base_amount")
    db_transaction.fee = txn_data.get("payment_charge")
    db_transaction.tax = txn_data.get("tax")
    db_transaction.error_code = txn_data.get("error_code")
    db_transaction.error_description = txn_data.get("error_description")

    if commit:
        db.commit()
        db.refresh(db_transaction)

    return db_transaction


def update_purchase(db: Session, purchase_id: int, updates: dict):
    purchase = get_purchase(db, purchase_id)
    if not purchase:
        return None
    for key, value in updates.items():
        setattr(purchase, key, value)
    db.commit()
    db.refresh(purchase)
    return purchase

def get_purchase_by_user_id_and_item_id_and_type(db: Session, user_id: int, item_id: int, item_type: str):
    return db.query(Purchase).filter(
        Purchase.purchased_user_id == user_id,
        Purchase.item_id == item_id,
        Purchase.item_type == item_type
    ).first()

def delete_purchase(db: Session, purchase_id: int):
    purchase = get_purchase(db, purchase_id)
    if not purchase:
        return None
    db.delete(purchase)
    db.commit()
    return purchase

def get_item_by_id_and_type(db: Session, item_id: int, item_type: str):
    if item_type == "ebook":
        from models.ebook import EBook
        return db.query(EBook).filter(EBook.id == item_id).first()
    elif item_type == "course":
        from models.course import Course
        return db.query(Course).filter(Course.id == item_id).first()
    else:
        return None  # or raise an exception if needed
    


def get_all_transactions(db:Session,page:int=1,limit:int=10,search:str=''):
    query = db.query(Transaction).order_by(Transaction.created_at.desc())
    if search:
        print('enter') 
        query = query.filter(or_(Transaction.transaction_id.like(f"%{search}%"),Transaction.order_id.like(f"%{search}%")))
    return to_pagination_response(query,TransactionResponse,page,limit)

def get_success_transactions(db:Session,page:int=1,limit:int=10,search:str=''):
    query = db.query(Transaction).filter(Transaction.status == "captured").order_by(Transaction.created_at.desc())
    if search:
        print('enter')
        query = query.filter(or_(Transaction.transaction_id.like(f"%{search}%"),Transaction.order_id.like(f"%{search}%")))
    return to_pagination_response(query,TransactionResponse,page,limit)

def get_failed_transactions(db:Session,page:int=1,limit:int=10,search:str=''):
    query = db.query(Transaction).filter(Transaction.status == "failed").order_by(Transaction.created_at.desc())
    if search:
        query = query.filter(or_(Transaction.transaction_id.like(f"%{search}%"),Transaction.order_id.like(f"%{search}%")))
    return to_pagination_response(query,TransactionResponse,page,limit)

def get_transaction_by_id(db:Session,transaction_id:str):
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()

def get_purchases(
    db: Session,
    page: int = 1,
    limit: int = 10,
    search: str = '',
    item_type: str | None = None,
    dummy: bool = False
):
    query = db.query(Purchase)

    if dummy:
        query = query.filter(Purchase.purchased_user_id == None)
    if item_type:
        query = query.filter(Purchase.item_type == item_type)

    if search:
        query = query.join(User, Purchase.purchased_user_id == User.id)
        query = query.filter(
            or_(
                User.name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )

    query = query.order_by(Purchase.created_at.desc())
    data = to_pagination_response(query, PurchaseResponse, page, limit)

    items = data.get('items', [])
    for i, item in enumerate(items):
        db_item = get_item_by_id_and_type(db, item.get('item_id'), item.get('item_type'))
        if db_item:
            if item.get('item_type') == "ebook":
                items[i]['item'] = EBookResponse.from_orm(db_item)
            elif item.get('item_type') == "course":
                items[i]['item'] = CourseResponse.from_orm(db_item)
        if item.get('transaction'):
            item['transaction']  =ListTransactionResponse.from_orm(item.get('transaction'))
    data['items'] = items
    return data


def get_all_purchases(db: Session, page: int = 1, limit: int = 10, search: str = ''):
    return get_purchases(db, page, limit, search)

def get_all_ebook_purchases(db: Session, page: int = 1, limit: int = 10, search: str = ''):
    return get_purchases(db, page, limit, search, item_type='ebook')

def get_all_course_purchases(db: Session, page: int = 1, limit: int = 10, search: str = ''):
    return get_purchases(db, page, limit, search, item_type='course')

def get_all_dummy_purchases(db: Session, page: int = 1, limit: int = 10, search: str = ''):
    return get_purchases(db, page, limit, search, dummy=True)


def get_purchase_by_all(
    db: Session,
    user_id: int | None,
    affiliate_user_id: int | None,
    item_id: int,
    item_type: str
):
    filters = [Purchase.item_id == item_id, Purchase.item_type == item_type]
    
    if user_id is not None:
        filters.append(Purchase.purchased_user_id == user_id)
    if affiliate_user_id is not None:
        filters.append(Purchase.affiliate_user_id == affiliate_user_id)

    return db.query(Purchase).filter(*filters).first()

