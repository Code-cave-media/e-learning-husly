
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from core.security import create_access_token
from core.deps import get_current_user,is_admin_user
from models.user import User
from db.session import get_db
from schemas.affiliate import *
from crud.affiliate import *
from core.deps import get_current_user
from crud.auth import get_user_by_user_id
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

@router.post('/add/click', response_model=AffiliateLinkResponse)       
def add_clicks_to_affiliate_link_(
    affiliate_user_id: int,
    item_id: int,
    item_type: str,
    db: Session = Depends(get_db),
):  
    user = get_user_by_user_id(db, affiliate_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Affiliate user not found.")
    
    affiliate_link = get_affiliate_link_by_all(db, user.id, item_id, item_type)
    if not affiliate_link:
        affiliate_link = create_affiliate_link(db,{
            'user_id': user.id,
            'item_id': item_id,
            'item_type': item_type,
        })
    print({
            'user_id': user.id,
            'item_id': item_id,
            'item_type': item_type,
        },affiliate_link)
    updated_link = add_clicks_to_affiliate_link(db, affiliate_link)

    return updated_link
