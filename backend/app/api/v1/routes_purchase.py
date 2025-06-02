from fastapi import HTTPException,APIRouter,status,Depends,Request,Query
from db.session import get_db
from sqlalchemy.orm import Session
from schemas.purchase import PaymentRequest
from core.gateway import client
from crud.auth import get_user_by_email
from crud.auth import *
from crud.purchase import *
from crud.course import get_course_by_id
from crud.ebook import get_ebook_by_id
from schemas.purchase import CheckoutResponse,AffiliateUser
from crud.auth import get_user_by_user_id,create_affiliate_account
from crud.coupon_code import get_coupon_by_code
from schemas.purchase import PurchaseVerifyRequest
from crud.affiliate import *
router = APIRouter()

@router.post('/checkout')
def purchase_course(data: PaymentRequest,db:Session=Depends(get_db)):
  # get the course or ebook by id
  db_item = None
  if data.affiliate_user_id:
    affiliate_user = get_user_by_user_id(db,data.affiliate_user_id)
    print(affiliate_user)
    if not affiliate_user:
      raise HTTPException(detail="Affiliate user not found",status_code=404)
  if data.item_type =='course':
    db_item = get_course_by_id(db,data.item_id)
    if not db_item:
      raise HTTPException(detail="Course not found",status_code=404)
  else:
    db_item = get_ebook_by_id(db,data.item_id)
    if not db_item:
      raise HTTPException(detail="EBook not found",status_code=404)
  
  # Verify coupon
  discount = 0
  db_coupon = None
  if data.coupon:
    db_coupon = get_coupon_by_code(db,data.coupon)
    if not db_coupon:
        raise HTTPException(status_code=400,detail="Coupon code not found")
    if db_coupon.no_of_use <= 0:
        raise HTTPException(status_code=400,detail="Coupon code has no uses left")
    if  db_coupon.type=='fixed' and db_coupon.min_purchase and db_item.price < db_coupon.min_purchase:
          raise HTTPException(status_code=400,detail="Minimum purchase amount not met")
    if db_coupon.type == 'fixed':
      discount = db_coupon.discount
    else :
      discount = db_item.price * (db_coupon.discount/ 100)
  # verify is the user already exist if new user 
  
  if data.user_id:
    user = get_user_by_user_id(db,data.user_id)
    if not user:
      raise HTTPException(detail="User not found",status_code=404)
  else:
    existing_user = get_user_by_email(db,data.email)
    if existing_user:
      raise HTTPException(detail="User with this email already exist",status_code=400)
    user =  get_temp_user_by_email(db,data.email)
    if user:
      user = update_temp_user(db,user,{'email':data.email,"password":data.password,"phone":data.phone,"name":data.name})
    else:
      user = create_temp_user(db,{'email':data.email,"password":data.password,"phone":data.phone,"name":data.name})
  user_id = user.id

  # create order
  razorpay_order  = client.order.create({
    "amount":db_item.price - discount,
    "currency": "INR",
    "receipt": str(user_id)
  })
  transaction_id = razorpay_order['id']
  # create transaction
  db_transaction_processing = create_transaction_processing(db,{
    "transaction_id" : transaction_id,
    "item_id":data.item_id,
    "item_type":data.item_type,
    "affiliate_user_id":affiliate_user.id if data.affiliate_user_id else None,
    "user_id":user_id,
    "is_new_user":True if data.user_id is None else False,
    "amount":db_item.price,
    "discount":discount,
    "coupon_code":data.coupon,
    "coupon_type":'fixed' if db_coupon and db_coupon.type == 'fixed' else 'percentage'
  })
  return razorpay_order

@router.post("/webhook/payment")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    received_signature = request.headers.get("X-Razorpay-Signature")
    secret = "irshad1213"

    if not verify_razorpay_signature(payload, received_signature, secret):
        return {"status": "unauthorized"}, 401

    data = await request.json()
    event = data.get("event")
    payment_entity = data["payload"]["payment"]["entity"]
    order_id = payment_entity.get("order_id")

    db_transaction_processing = get_transaction_processing_by_id(db, order_id)
    temp_user = None
    purchase = None
    
    try:
        affiliate_account = None
        new_user_affiliate_account = None
        db_affiliate_link_purchase = None
        if event == "payment.captured" and db_transaction_processing:
            if db_transaction_processing.is_new_user:
                temp_user = get_temp_user_by_id(db, db_transaction_processing.user_id)
                user = create_user(
                    db,
                    UserCreate(
                        email=temp_user.email,
                        password=temp_user.password,
                        name=temp_user.name,
                        phone=temp_user.phone
                    ),
                    is_hashed_pw=True)
                new_user_affiliate_account = create_affiliate_account(db, user.id)
                db_transaction_processing.user_id = user.id
            if db_transaction_processing.affiliate_user_id:
                affiliate_account = get_affiliate_account_by_user_id(db, db_transaction_processing.affiliate_user_id)
                db_item = get_item_by_id_and_type(db, db_transaction_processing.item_id, db_transaction_processing.item_type)
                if affiliate_account:
                    affiliate_account.balance += db_item.commission
                    affiliate_account.total_earnings += db_item.commission

                db_affiliate_link = get_affiliate_link_by_all(db,db_transaction_processing.affiliate_user_id,db_transaction_processing.item_id, db_transaction_processing.item_type)
                db_affiliate_link_purchase = add_purchase_to_affiliate_link(db,db_affiliate_link,db_item.commission,commit=False)
            # Create purchase
            purchase = create_purchase(db, db_transaction_processing, commit=False)
            # Delete transaction processing and temp user
            db.delete(db_transaction_processing)
            if temp_user:
                db.delete(temp_user)
        # Create transaction for all types of events
        transaction = create_transaction(
            db=db,
            transaction_id=payment_entity['id'],
            db_purchase=purchase,
            txn_data=payment_entity,
            commit=False
        )
        # add commission to affiliate user account if applicable
        
        db.commit()
        if purchase:
            db.refresh(purchase)
        if affiliate_account:   
            db.refresh(affiliate_account)
        if new_user_affiliate_account:
            db.refresh(new_user_affiliate_account)
        if db_affiliate_link_purchase:
            db.refresh(db_affiliate_link_purchase)
        return {
            "payment_status": event,
            "transaction_id": transaction.id
        }

    except Exception as e:
        print(f"Error processing webhook: {e}")
        db.rollback()
        if user:
            db.delete(user)
        if purchase:
            db.delete(purchase)
        return {"payment_status": "error", "detail": str(e)}

@router.get('/checkout/{type}/{item_id}')
def get_transaction(type: str,
    item_id:str,
    ref: str | None = Query(None),  
    db: Session = Depends(get_db),
    user_id:str = Query(None)
    ):
    if(type not in ['course', 'ebook']):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid type")
    if type == 'course':
        db_item = get_course_by_id(db, item_id)
    else:
        db_item = get_ebook_by_id(db, item_id)  
    if not db_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"This {'Training' if type=='course' else 'BluePrint'} is either not found or not currently available for viewing.")
    if user_id and user_id != "" and user_id!='null' and user_id != "undefined":
        user = get_user_by_user_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        if get_purchase_by_user_id_and_item_id_and_type(db, user.id, item_id, type):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already purchased this item")
    affiliate_user = None
    if ref and ref != "" and ref!='null' and ref != "undefined":
        affiliate_user = get_user_by_user_id(db, ref)
        if not affiliate_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate user not found")
        if user_id and user_id == affiliate_user.user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot refer yourself")
    return {
        "item_data":CheckoutResponse.from_orm(db_item),
        "affiliate_user": AffiliateUser.from_orm(affiliate_user) if affiliate_user else None,
    }

@router.post('/checkout/verify')
def verify_transaction(data: PurchaseVerifyRequest, db: Session = Depends(get_db)):
    db_transaction_processing = get_transaction_by_transaction_id(db, data.transaction_id)
    if not db_transaction_processing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return { "status" :db_transaction_processing.status }
