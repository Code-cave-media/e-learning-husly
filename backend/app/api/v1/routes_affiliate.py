from fastapi import APIRouter,Depends,HTTPException,Query
from sqlalchemy.orm import Session
from core.security import create_access_token
from core.deps import get_current_user,is_admin_user
from models.user import User
from db.session import get_db
from schemas.affiliate import *
from crud.affiliate import *
from core.deps import get_current_user
from crud.auth import get_user_by_user_id
from crud.purchase import get_item_by_id_and_type
from models.affiliate import UPIDetails,BankDetails
router = APIRouter()

@router.post('/create', response_model=AffiliateLinkResponse)
def create_affiliate_link_(
    data: AffiliateLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data_dict = data.dict()
    data_dict['user_id'] = current_user.id
    existing_link = get_affiliate_link_by_all(db, current_user.id, data_dict['item_id'], data_dict['item_type'])
    if existing_link:
        return existing_link
    affiliate_link = create_affiliate_link(db, data_dict)
    return affiliate_link

@router.post('/click/add')       
def add_clicks_to_affiliate_link_(
    data:AddAffiliateLinkClicks,
    db: Session = Depends(get_db),
):  
    user = get_user_by_user_id(db, data.affiliate_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Affiliate user not found.")
    
    affiliate_link = get_affiliate_link_by_all(db, user.id, data.item_id, data.item_type)
    if not affiliate_link:
        item = get_item_by_id_and_type(db,data.item_id,data.item_type)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found.")
        affiliate_link = create_affiliate_link(db,{
            'user_id': user.id,
            'item_id': data.item_id,
            'item_type': data.item_type,
        })
    updated_link = add_clicks_to_affiliate_link(db, affiliate_link)
    return {'status':True}

@router.post('/withdraw', response_model=WithdrawResponse)
def create_user_dashboard_withdraw(
    data: WithdrawCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    affiliate_account = get_affiliate_account_by_user_id(db, user_id=current_user.id)
    if affiliate_account.balance < data.amount:
        raise HTTPException(status_code=400, detail='Insufficient balance')

    db_withdraw = create_withdraw(db, current_user, data)

    db.add(db_withdraw) 
    update_affiliate_account_balance(db, affiliate_account, data.amount, False,is_withdraw=True)
    
    db.commit()  
    db.refresh(db_withdraw)  
    db.refresh(affiliate_account)

    # update account details
    update_or_create_account_details(db,affiliate_account,data)

    return db_withdraw

@router.get('/withdraw-account-details')
def get_bank_account_details(db:Session=Depends(get_db),user:User=Depends(get_current_user)):
    affiliate_account = db.query(AffiliateAccount).filter(AffiliateAccount.id == user.id).first()
    db_upi  = db.query(UPIDetails).filter(UPIDetails.account_id == affiliate_account.id).first()
    db_bank = db.query(BankDetails).filter(UPIDetails.account_id == affiliate_account.id).first()
    res = {
        "upi_id":UPIDetailsResponse.from_orm(db_upi) if db_upi else None,
        "bank_details":BankAccountResponse.from_orm(db_bank) if db_bank else None
    }
    return res

@router.get('/withdrawals')
def get_withdrawals(
    db:Session=Depends(get_db),
    current_user:User=Depends(is_admin_user),
    page:int=Query(1,ge=1),
    limit:int=Query(10,ge=1,le=100),
    search:str=Query(''),
    filter:str=Query('all',regex='^(all|success|failed|pending)$')
):
    return get_withdrawals_by_status(db,page,limit,search,filter)

@router.put('/withdraw/{withdraw_id}/status',response_model=WithdrawResponse)
def update_withdraw_status_api( 
    withdraw_id:int,
    data:WithdrawUpdateStatus,
    db:Session=Depends(get_db),
    current_user:User=Depends(is_admin_user)
):
    db_withdraw = get_withdraw_by_id(db,withdraw_id)
    if not db_withdraw:
        raise HTTPException(status_code=404,detail="Withdraw not found")
    update_withdraw_status(db,db_withdraw,data.status,reason=data.explanation)
    if data.status != 'success':
        db_account = get_or_create_affiliate_account(db,db_withdraw.user_id)
        update_affiliate_account_balance(db,db_account,db_withdraw.amount,True,is_withdraw=False)
    return db_withdraw