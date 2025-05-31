
from sqlalchemy.orm import Session
from models.affiliate import AffiliateLink,AffiliateAccount
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

def add_clicks_to_affiliate_link(db: Session, affiliate_link: AffiliateLink):
    affiliate_link.clicks += 1
    db.commit()
    db.refresh(affiliate_link)
    return affiliate_link