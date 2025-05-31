
from sqlalchemy.orm import Session
from models.affiliate import AffiliateLink,AffiliateAccount ,AffiliateLinkClick,AffiliateLinkPurchase
from models.user import User
from datetime import datetime, timedelta
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
    total_clicks = sum([ len(link.clicks) for link in links])
    return total_clicks
    
def get_total_purchases(db:Session,user:User):
    links = user.affiliate_links
    total_purchases = sum([ len(link.purchases) for link in links])
    return total_purchases

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