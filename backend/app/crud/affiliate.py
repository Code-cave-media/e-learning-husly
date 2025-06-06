
from sqlalchemy.orm import Session
from models.affiliate import AffiliateLink,AffiliateAccount ,AffiliateLinkClick,AffiliateLinkPurchase,Withdraw,UPIDetails,BankDetails
from models.user import User
from datetime import datetime, timedelta
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from schemas.affiliate import  *
from crud.utils import to_pagination_response
from schemas.user import UserResponse

def create_affiliate_link(db:Session,data:dict):
    affiliate_link = AffiliateLink(
      **data
    )
    db.add(affiliate_link)
    db.commit()
    db.refresh(affiliate_link)
    return affiliate_link

def get_affiliate_link_by_all(db: Session, user_id: int, item_id: int, item_type: str):
    return db.query(AffiliateLink).filter(
        AffiliateLink.user_id == user_id,
        AffiliateLink.item_id == item_id,
        AffiliateLink.item_type == item_type
    ).first()

def get_affiliate_account_by_user_id(db: Session, user_id: int):
    return db.query(AffiliateAccount).filter(AffiliateAccount.user_id == user_id).first()

def get_affiliate_account_by_id(db: Session, id: int):
    return db.query(AffiliateAccount).filter(AffiliateAccount.id == id).first()

def add_clicks_to_affiliate_link(db: Session, affiliate_link: AffiliateLink):
    db_link_click = AffiliateLinkClick(link_id=affiliate_link.id)
    db.add(db_link_click)
    db.commit()
    db.refresh(db_link_click)
    return db_link_click

def add_purchase_to_affiliate_link(db: Session, affiliate_link: AffiliateLink,amount=0,commit=True):
    db_link_click = AffiliateLinkPurchase(link_id=affiliate_link.id,amount=amount)
    db.add(db_link_click)
    if commit:
        db.commit()
        db.refresh(db_link_click)
    return db_link_click

def get_total_clicks(db:Session,user:User):
    links = user.affiliate_links
    now = datetime.now(timezone.utc)
    # First day of current and last month
    start_of_current_month = now.replace(day=1)
    start_of_last_month = (start_of_current_month - timedelta(days=1)).replace(day=1)
    end_of_last_month = start_of_current_month - timedelta(seconds=1)
    current_month_clicks = 0
    last_month_clicks = 0
    total_clicks = 0
    for link in links:
        for click in link.clicks:
            if start_of_current_month <= click.created_at <= now:
                current_month_clicks += 1
            elif start_of_last_month <= click.created_at <= end_of_last_month:
                last_month_clicks += 1
            total_clicks+=1
    # Percentage hike calculation
    if last_month_clicks == 0:
        percent_hike = 100 if current_month_clicks > 0 else 0
    else:
        percent_hike = ((current_month_clicks - last_month_clicks) / last_month_clicks) * 100

    return {'value':total_clicks,'hike':round(percent_hike, 2)},current_month_clicks,last_month_clicks
    
def get_total_purchases(db: Session, user: User):
    links = user.affiliate_links
    now = datetime.now(timezone.utc)

    # First day of current and last month
    start_of_current_month = now.replace(day=1)
    start_of_last_month = (start_of_current_month - timedelta(days=1)).replace(day=1)
    end_of_last_month = start_of_current_month - timedelta(seconds=1)

    current_month_purchases = 0
    last_month_purchases = 0
    total_purchases = 0

    for link in links:
        for purchase in link.purchases:
            if start_of_current_month <= purchase.created_at <= now:
                current_month_purchases += 1
            elif start_of_last_month <= purchase.created_at <= end_of_last_month:
                last_month_purchases += 1
            total_purchases += 1
    return total_purchases,current_month_purchases,last_month_purchases

def find_conversion_rate(t_clicks, t_purchases, c_purchases, l_purchases, c_clicks, l_clicks):
    # Overall conversion rate
    if t_clicks == 0:
        conversion_rate = 0
    else:
        conversion_rate = (t_purchases / t_clicks) * 100

    # Last month conversion rate
    last_month_rate = (l_purchases / l_clicks) * 100 if l_clicks > 0 else 0

    # Current month conversion rate
    current_month_rate = (c_purchases / c_clicks) * 100 if c_clicks > 0 else 0
    # Conversion rate hike calculation
    if last_month_rate == 0:
        rate_hike = 100 if current_month_rate > 0 else 0
    else:
        rate_hike = ((current_month_rate - last_month_rate) / last_month_rate) * 100

    return {
        "value": round(conversion_rate, 2),
        "hike": round(rate_hike, 2)
    }

def get_total_active_links(db:Session,user:User):
    links = user.affiliate_links
    one_month_ago = datetime.utcnow() - timedelta(days=30)
    total_active_link = 0
    for link in links:
        click_count = db.query(AffiliateLinkClick).filter(
        AffiliateLinkClick.link_id ==link.id,
        AffiliateLinkClick.created_at >= one_month_ago
        ).count()
        purchase_count = db.query(AffiliateLinkPurchase).filter(
        AffiliateLinkPurchase.link_id == link.id,
        AffiliateLinkPurchase.created_at >= one_month_ago
        ).count()
        print(click_count,purchase_count)
        if click_count and purchase_count:
            total_active_link+=1
    return total_active_link

def get_total_earnings(db: Session, user: User):
    total_earnings = get_affiliate_account_by_id(db,user.id).total_earnings
    now = datetime.now(timezone.utc)
    start_of_current_month = now.replace(day=1)
    start_of_last_month = (start_of_current_month - timedelta(days=1)).replace(day=1)
    end_of_last_month = start_of_current_month - timedelta(seconds=1)

    # Get the user's affiliate link IDs
    link_ids = [link.id for link in user.affiliate_links]

    # Earnings for this month
    this_month_total_earnings = db.query(func.coalesce(func.sum(AffiliateLinkPurchase.amount), 0)).filter(
        AffiliateLinkPurchase.link_id.in_(link_ids),
        AffiliateLinkPurchase.created_at >= start_of_current_month,
        AffiliateLinkPurchase.created_at <= now
    ).scalar()
    # Earnings for last month
    last_month_total_earnings = db.query(func.coalesce(func.sum(AffiliateLinkPurchase.amount), 0)).filter(
        AffiliateLinkPurchase.link_id.in_(link_ids),
        AffiliateLinkPurchase.created_at >= start_of_last_month,
        AffiliateLinkPurchase.created_at <= end_of_last_month
    ).scalar()
    # Hike calculation
    if last_month_total_earnings == 0:
        hike = 100 if this_month_total_earnings > 0 else 0
    else:
        hike = ((this_month_total_earnings - last_month_total_earnings) / last_month_total_earnings) * 100
    return {
        "value": round(total_earnings, 2),
        "hike": round(hike, 2)
    }

def create_withdraw(db:Session,user:User,data:WithdrawCreate,commit=False):
    account_details = None
    if data.upi_id:
        account_details = f"UPI ID : ${data.upi_id}"
    else:
        account_details = f"Bank Name: ${data.bank_name}, Account name: ${data.account_name}, Account number: ${data.account_number}, IFSC: ${data.ifsc_code} "
    
    db_withdraw = Withdraw(user_id = user.id,amount = data.amount,status='pending',account_details=account_details)
    db.add(db_withdraw)
    if(commit):
        db.commit()
        db.refresh(db_withdraw)
    return db_withdraw

def add_purchase_commission_to_affiliate_account(db:Session,account:AffiliateAccount,amount:float,commit=False):
    account.balance += amount
    account.total_earnings += amount
    if commit:
        db.commit()
        db.refresh(account)
    return account

def update_affiliate_account_balance(db:Session,account:AffiliateAccount,amount:float,commit=False,is_withdraw=False):
    if is_withdraw:
        account.balance -= amount
    else:
        account.balance += amount
    if commit:
        db.commit()
        db.refresh(account)
    return account

def update_or_create_account_details(db:Session,affiliate_account:AffiliateAccount,data:dict):
    db_upi = db.query(UPIDetails).filter(UPIDetails.account_id == affiliate_account.id).first()
    db_bank = db.query(BankDetails).filter(BankDetails.account_id == affiliate_account.id).first()
    if not db_upi and data.upi_id:
        db_upi = UPIDetails(account_id=affiliate_account.id,upiId=data.upi_id)
        db.add(db_upi)
    elif db_upi and data.upi_id:
        db_upi.upiId = data.upi_id
    print(db_upi, data.upi_id)
    if not db_bank and data.bank_name and data.account_name and data.account_number and data.ifsc_code:
        db_bank = BankDetails(account_id=affiliate_account.id,bank_name=data.bank_name,account_name=data.account_name,account_number=data.account_number,ifsc_code=data.ifsc_code)
        db.add(db_bank)
    elif db_bank and data.bank_name and data.account_name and data.account_number and data.ifsc_code:
        db_bank.bank_name = data.bank_name
        db_bank.account_name = data.account_name
        db_bank.account_number = data.account_number
        db_bank.ifsc_code = data.ifsc_code
    
    db.commit()
    db.refresh(db_upi)
    db.refresh(db_bank)


def get_or_create_affiliate_account(db:Session,user_id:int):
    db_affiliate_account = get_affiliate_account_by_user_id(db,user_id)
    if not db_affiliate_account:
        db_affiliate_account = AffiliateAccount(user_id=user_id)
        db.add(db_affiliate_account)
        db.commit()
        db.refresh(db_affiliate_account)
    return db_affiliate_account

def get_or_create_affiliate_link(db:Session,user_id:int,item_id:int,item_type:str):
    db_affiliate_link = get_affiliate_link_by_all(db,user_id,item_id,item_type)
    if not db_affiliate_link:
        db_affiliate_link = AffiliateLink(user_id=user_id,item_id=item_id,item_type=item_type)
        db.add(db_affiliate_link)
        db.commit()
        db.refresh(db_affiliate_link)
    return db_affiliate_link

def get_withdrawals_by_status(
    db: Session,
    page: int = 1,
    limit: int = 10,
    search: str = '',
    status: str | None = None
):
    query = db.query(Withdraw).join(User)
    if status and status != 'all':
        print('enter')
        query = query.filter(Withdraw.status == status)

    if search:
        query = query.filter(User.name.ilike(f"%{search}%"))

    query = query.order_by(Withdraw.created_at.desc())
    data = to_pagination_response(query, WithdrawResponse, page, limit)

    items = data.get('items', [])

    # Attach user info
    user_ids = [item.get('user_id') for item in items if item.get('user_id')]
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    user_map = {user.id: user for user in users}

    for i, item in enumerate(items):
        user = user_map.get(item.get('user_id'))
        if user:
            items[i]['user'] = UserResponse.from_orm(user)

    data['items'] = items
    return data


def get_withdraw_by_id(db:Session,withdraw_id:int):
    return db.query(Withdraw).filter(Withdraw.id == withdraw_id).first()

def update_withdraw_status(db:Session,db_withdraw:Withdraw,status:str,reason:str):
    db_withdraw.status = status
    if reason:
        db_withdraw.explanation = reason
    db.commit()
    db.refresh(db_withdraw)
    return db_withdraw





