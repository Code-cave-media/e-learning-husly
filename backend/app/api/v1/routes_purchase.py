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
from schemas.purchase import PurchaseVerifyRequest,PurchaseCreateRequest,PurchaseResponse
from crud.affiliate import *
from schemas.common import PaginationResponse
from core.deps import is_admin_user
from crud.user_dashboard import get_item_by_id_and_type
import random
from core.config import settings
import httpx, os
import uuid
from pprint import pprint
import traceback
router = APIRouter()

@router.post('/checkout')
def purchase_course(data: PaymentRequest,db:Session=Depends(get_db)):
    # get the course or ebook by id
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

    # Verify coupon
    discount = 0
    db_coupon = None
    if data.coupon:
        db_coupon = get_coupon_by_code(db,data.coupon)
        if not db_coupon:
            raise HTTPException(status_code=400,detail="Coupon code not found")
        if db_coupon.no_of_access <= 0:
            raise HTTPException(status_code=400,detail="Coupon code has no uses left")
        if  db_coupon.type=='fixed' and db_coupon.min_purchase and db_item.price < db_coupon.min_purchase:
            raise HTTPException(status_code=400,detail="Minimum purchase amount not met")
        if db_coupon.type == 'percentage':
            discount = (db_item.price * db_coupon.discount) / 100
        elif db_coupon.type == 'flat':
            discount = db_coupon.discount
    else :
        discount = 0

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
    order_id = f"order_{uuid.uuid4().hex[:24]}"

    payload = {
        "order_id": order_id,
        "order_amount": db_item.price - discount,
        "order_currency": "INR",
        "customer_details": {
            "customer_id": str(user_id),
            "customer_email": data.email,
            "customer_phone": data.phone,
            "customer_name": data.name,
        }
    }
    headers = {
        "x-client-id": settings.CASHFREE_APP_ID_TEST if not settings.PRODUCTION else settings.CASHFREE_APP_ID_PROD,
        "x-client-secret": settings.CASHFREE_SECRET_KEY_TEST if not settings.PRODUCTION else settings.CASHFREE_SECRET_KEY_PROD,
        "x-api-version": "2022-09-01",
        "Content-Type": "application/json"
    }
    base_url = settings.CASHFREE_TEST_BASE_URL if not settings.PRODUCTION else settings.CASHFREE_PROD_BASE_URL
    print(headers,base_url)
    response = httpx.post(f"{base_url}/orders", headers=headers, json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    response_data = response.json()
    pprint(response_data)
    payment_session_id = response_data["payment_session_id"]
    order_id = response_data["order_id"]
    create_transaction_processing(db, {
        "transaction_id": order_id,
        "item_id": data.item_id,
        "item_type": data.item_type,
        "affiliate_user_id":affiliate_user.id if data.affiliate_user_id else None,
        "user_id": user_id,
        "is_new_user": data.user_id is None,
        "amount": db_item.price,
        "discount": discount,
        "coupon_code": data.coupon,
        "coupon_type": 'fixed' if db_coupon and db_coupon.type == 'fixed' else 'percentage'
    })
    print({"payment_session_id": payment_session_id, "transaction_id": order_id})
    return {"payment_session_id": payment_session_id, "transaction_id": order_id}

# create order
#   razorpay_order  = client.order.create({
#     "amount":db_item.price - discount,
#     "currency": "INR",
#     "receipt": str(user_id)
#   })
#   transaction_id = razorpay_order['id']
#   # create transaction
#   db_transaction_processing = create_transaction_processing(db,{
#     "transaction_id" : transaction_id,
#     "item_id":data.item_id,
#     "item_type":data.item_type,
#     "affiliate_user_id":affiliate_user.id if data.affiliate_user_id else None,
#     "user_id":user_id,
#     "is_new_user":True if data.user_id is None else False,
#     "amount":db_item.price,
#     "discount":discount,
#     "coupon_code":data.coupon,
#     "coupon_type":'fixed' if db_coupon and db_coupon.type == 'fixed' else 'percentage'
#   })
#   return razorpay_order

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
                    affiliate_account = add_purchase_commission_to_affiliate_account(db,affiliate_account,db_item.commission,commit=False)

                db_affiliate_link = get_affiliate_link_by_all(db,db_transaction_processing.affiliate_user_id,db_transaction_processing.item_id, db_transaction_processing.item_type)
                db_affiliate_link_purchase = add_purchase_to_affiliate_link(db,db_affiliate_link,db_item.commission,commit=False)
            # Create purchase
            purchase = create_purchase(db, db_transaction_processing, commit=False)
            # Delete transaction processing and temp user
            db.delete(db_transaction_processing)
            if temp_user:
                db.delete(temp_user)
        # Create transaction for all types of events
        transaction = create_razorpay_transaction(
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


@router.post("/cashfree-webhook")
async def cashfree_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        event = data.get("type")  # 'type' instead of 'event' in Cashfree
        order_data = data.get("data", {}).get("order", {})
        payment_info = data.get("data", {}).get("payment", {})
        customer_info =  data.get("data", {}).get("customer_details", {})
        order_id = order_data.get("order_id")
        payment_status = payment_info.get("payment_status")
        db_transaction_processing = get_transaction_processing_by_id(db, order_id)
        purchase = None
        user = None
        affiliate_account = None
        new_user_affiliate_account = None
        db_affiliate_link_purchase = None
        db_transaction = None
        temp_user = None
        if not db_transaction_processing: return  {"payment_status": "error", "detail": "Transaction processing not found"}
        db_item = get_item_by_id_and_type(db, db_transaction_processing.item_id, db_transaction_processing.item_type)
        if payment_status == "SUCCESS":
            # Handle new user
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
                if affiliate_account:
                    affiliate_account = add_purchase_commission_to_affiliate_account(db,affiliate_account,db_item.commission,commit=False)

                db_affiliate_link = get_affiliate_link_by_all(db,db_transaction_processing.affiliate_user_id,db_transaction_processing.item_id, db_transaction_processing.item_type)
                db_affiliate_link_purchase = add_purchase_to_affiliate_link(db,db_affiliate_link,db_item.commission,commit=False)
                
            # Create purchase
            purchase = create_purchase(db, db_transaction_processing, commit=False)
            
            db.delete(db_transaction_processing)
            if temp_user:
                print('deleting temp user',temp_user)
                db.delete(temp_user)
        
        db_transaction = get_transaction_by_transaction_id(db, order_id)
        if not db_transaction:
            db_transaction = create_cashfree_transaction(
                    db=db,
                    transaction_id=order_id,
                    txn_data=payment_info,
                    customer_info=customer_info,
                    provider="cashfree",
                    item_id=db_transaction_processing.item_id,
                    item_type=db_transaction_processing.item_type,
                    commit=False
                )
            db.add(db_transaction)
        else:
            db_transaction = get_transaction_by_transaction_id(db, order_id)
            if db_transaction:
                update_cashfree_transaction(db,db_transaction, payment_info, 'cashfree',commit=False)
        db.commit()
        if purchase:
            purchase.transaction_id = db_transaction.id if db_transaction else None
            print('added transaction Id',db_transaction,db_transaction.id)
            db.add(purchase)
        db.commit()
        if affiliate_account:   
            db.refresh(affiliate_account)
        if new_user_affiliate_account:
            db.refresh(new_user_affiliate_account)
        if db_affiliate_link_purchase:
            db.refresh(db_affiliate_link_purchase)
        if db_transaction:
            db.refresh(db_transaction)
        if purchase:
            db.refresh(purchase)
        return {
            "payment_status": event,
            "transaction_id": order_id
        }

    except Exception as e:
        traceback.print_exc()
        print(f"Error processing Cashfree webhook: {e}")
        db.rollback()
        if user:
            db.delete(user)
            db.commit() 
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



@router.get("/transactions",response_model=PaginationResponse)
def get_transaction_history(db:Session=Depends(get_db),current_user:User=Depends(is_admin_user),
                            page:int=Query(1),
                            limit:int=Query(10),
                            filter:str=Query(''),
                            search:str=Query(''),
                            ):
    if filter == "all":
        return get_all_transactions(db,page,limit,search)
    elif filter == "success":
        return get_success_transactions(db,page,limit,search)
    elif filter == "failed":
        return get_failed_transactions(db,page,limit,search)


@router.get("/purchases")
def get_transaction_history(db:Session=Depends(get_db),current_user:User=Depends(is_admin_user),
                            page:int=Query(1),
                            limit:int=Query(10),
                            filter:str=Query(''),
                            search:str=Query(''),
                            ):
    print(db.query(Purchase).filter(
        Purchase.purchased_user_id == 15,
        Purchase.item_id == 7,
        Purchase.item_type == 'ebook',
        Purchase.affiliate_user_id == None,
    ).first())
    if filter == "all":
        return get_all_purchases(db,page,limit,search)
    elif filter == "ebook":
        return get_all_ebook_purchases(db,page,limit,search)
    elif filter == "course":
        return get_all_course_purchases(db,page,limit,search)
    else:
        return get_all_dummy_purchases(db,page,limit,search)
@router.post("/create")
def create_purchase_from_admin(data:PurchaseCreateRequest,db:Session=Depends(get_db),current_user:User=Depends(is_admin_user)):
    #verify user and items first
    if data.user_id:
        id = str(data.user_id) if isinstance(data.user_id,int) else data.user_id
        purchase_user = get_user_by_user_id(db,id)
        if not purchase_user:
            id = int(data.user_id) if isinstance(data.user_id,str) else data.user_id
            purchase_user = get_user_by_id(db,id)
            if not purchase_user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db_item = get_item_by_id_and_type(db,data.item_id, data.item_type)
    if not db_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    affiliate_user = None
    if data.affiliate_user_id:
        id = str(data.user_id) if isinstance(data.user_id,int) else data.user_id
        affiliate_user = get_user_by_user_id(db,id)
        if not affiliate_user:
            id = int(data.affiliate_user_id) if isinstance(data.affiliate_user_id,str) else data.affiliate_user_id
            affiliate_user = get_user_by_id(db,id)
            if not affiliate_user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") 
    db_purchase = exist_purchase = None
    if data.user_id :
        db_purchase = exist_purchase = get_purchase_by_all(db,purchase_user.id,None,data.item_id,data.item_type)
    if db_purchase:
        if affiliate_user and not db_purchase.affiliate_user_id:
            db_purchase.affiliate_user_id = affiliate_user.id
        if purchase_user and not db_purchase.purchased_user_id:
            db_purchase.purchased_user_id = purchase_user.id
    else:
        data.amount =  db_item.price
        db_purchase = create_purchase(db,data,commit=False) 
    affiliate_account = db_link = db_clicks = db_link_purchase =  None
    total_links = []
    if affiliate_user:
        affiliate_account = get_or_create_affiliate_account(db,affiliate_user.id)
        affiliate_account = add_purchase_commission_to_affiliate_account(db,affiliate_account,db_item.commission,commit=False)
        db_link = get_or_create_affiliate_link(db,affiliate_user.id,data.item_id,data.item_type)
        if not data.user_id:
            print('enter',random.randint(1,4))
            for i in range(random.randint(1,4)):
                print('iterating')
                db_clicks = add_clicks_to_affiliate_link(db,db_link)
                total_links.append(db_clicks)
                
        else:
            db_clicks = add_clicks_to_affiliate_link(db,db_link)
            total_links.append(db_clicks)
        db_link_purchase = add_purchase_to_affiliate_link(db,db_link,db_item.commission,commit=False)
    if not exist_purchase:
        db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    if affiliate_account:
        db.refresh(affiliate_account)
    if total_links:
        for link in total_links:
            db.refresh(link)
    if db_link_purchase:
        db.refresh(db_link_purchase)
    response = PurchaseResponse.from_orm(db_purchase).dict()
    if data.item_type == 'course':
        response['item'] = CourseResponse.from_orm(db_item)
    else:
        response['item'] = EBookResponse.from_orm(db_item)
    
    return response

