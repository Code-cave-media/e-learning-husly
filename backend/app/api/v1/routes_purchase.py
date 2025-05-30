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
router = APIRouter()

@router.post('/e-book-course')
def purchase_course(data: PaymentRequest,db:Session=Depends(get_db)):
  db_item = None
  if data.affiliate_user_id:
    affiliate_user = get_user_by_user_id(db,data.affiliate_user_id)
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
  
  # verify is the user already exist if new user 
  if not data.user_id and (not data.email or not data.password):
    raise HTTPException(detail="User data not given",status_code=400)
  if not data.user_id and data.email and data.password:
    existing_user = get_user_by_email(db,data.email)
    if existing_user:
      raise HTTPException(detail="User with this email already exist",status_code=400)
    user =  get_temp_user_by_email(db,data.email)
    if user:
      print('updated')
      user = update_temp_user(db,user,{'email':data.email,"password":data.password})
    else:
      user = create_temp_user(db,{'email':data.email,"password":data.password})
  user_id = data.user_id if data.user_id else user.id

  # create order
  razorpay_order  = client.order.create({
    "amount":db_item.price,
    "currency": "INR",
    "receipt": str(user_id)
  })
  transaction_id = razorpay_order['id']
  # create transaction
  db_transaction_processing = create_transaction_processing(db,{
    "transaction_id" : transaction_id,
    "item_id":data.item_id,
    "item_type":data.item_type,
    "affiliate_user_id":data.affiliate_user_id,
    "user_id":user_id,
    "is_new_user":True if existing_user else True,
    "amount":db_item.price
  })
  print(db_transaction_processing.transaction_id,razorpay_order)
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

    if event == "payment.captured":
        db_transaction_processing = get_transaction_processing_by_id(db, payment_entity['order_id'])
        if not db_transaction_processing:
            return {"payment_status": "not_found"}

        try:
            with db.begin():
                if db_transaction_processing.is_new_user:
                    temp_user = get_temp_user_by_id(db, db_transaction_processing.user_id)
                    user = create_user(db, UserCreate(email=temp_user.email, password=temp_user.password), is_hashed_pw=True)
                    db_transaction_processing.user_id = user.id

                # Create purchase and transaction atomically
                purchase = create_purchase(db, db_transaction_processing, commit=False)
                transaction = create_transaction(db, payment_entity['order_id'], purchase, payment_entity, commit=False)

                # Delete TransactionProcessing entry
                db.delete(db_transaction_processing)
                if(temp_user):
                  db.delete(temp_user)

            return {"payment_status": "captured"}
        
        except Exception as e:
            db.rollback()
            return {"payment_status": "error", "detail": str(e)}

    elif event == "payment.failed":
        return {"payment_status": "failed"}

    return {"payment_status": "unknown"}


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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    if ref:
        affiliate_user = get_user_by_user_id(db, ref)
        if not affiliate_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affiliate user not found")
        if user_id and user_id == affiliate_user.user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot refer yourself")
    return {
      "item_data":CheckoutResponse.from_orm(db_item),
      "affiliate_user": AffiliateUser.from_orm(affiliate_user) if ref else None,
    }