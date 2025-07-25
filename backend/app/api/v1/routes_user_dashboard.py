from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session
from core.deps import get_current_user
from db.session import get_db
from crud.user_dashboard import *
from crud.affiliate import *
from fastapi import Query
from crud.affiliate import find_conversion_rate
from crud.affiliate import *
from core.deps import is_admin_user
from schemas.course import ItemListResponse
from crud.auth import get_user_by_user_id,get_user_by_id
from schemas.user import UserResponse
from schemas.course import CourseResponse   
from schemas.ebook import EBookResponse
from sqlalchemy import or_
import math


router = APIRouter()

@router.get('/list')
def get_user_dashboard_home_data(db: Session = Depends(get_db),current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    filter: str = Query('all', regex='^(all|courses|ebooks)$')
    ):
    if filter == 'all':
        return get_user_purchased_course_and_ebook(db, current_user, page, limit)
    elif filter == 'courses':   
        return get_user_purchased_courses(db, current_user, page, limit)
    elif filter == 'ebooks':
        return get_user_purchased_ebooks(db, current_user, page, limit) 
    return []

@router.get('/card')
def get_user_dashboard_home_card(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return {
        "total_purchase":get_total_user_purchases(current_user),
        "total_progressing_course":get_total_progressing_courses(db,current_user),
        "total_ebooks":get_total_purchased_ebooks(current_user),
        "total_courses":get_total_purchased_courses(current_user),
    }

@router.get('/courses')
def get_user_dashboard_courses(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    filter: str = Query('all', regex='^(all|my|new|featured)$'),
    search:str = Query("")
):
    if filter == 'all':
        return get_all_courses(db, current_user, page, limit,search)
    elif filter == 'my':
        return get_user_purchased_courses(db, current_user, page, limit,search)
    elif filter == 'new':
        return get_new_courses(db, current_user, page, limit,search)
    elif filter == 'featured':
        return get_featured_courses(db, current_user,page, limit,search)
    return []

@router.get('/ebooks')
def get_user_dashboard_ebooks(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    filter: str = Query('all', regex='^(all|my|new|featured)$'),
    search:str = Query("")
):
    if filter == 'all':
        return get_all_ebooks(db, current_user, page, limit,search)
    elif filter == 'my':
        return get_user_purchased_ebooks(db, current_user, page, limit,search)
    elif filter == 'new':
        return get_new_ebooks(db, current_user, page, limit,search)
    elif filter == 'featured':
        return get_featured_ebooks(db,current_user, page, limit,search)
    return []   

@router.get('/affiliate-dashboard')
def get_affiliate_dashboard(db:Session=Depends(get_db),current_user:User=Depends(get_current_user)):
    # fetch the cards details
    response = {
        "overview":{},
        "line_graph":{},
        "bar_graph":{},
        "recent_activity":[{}]
    }
    response['overview']['total_earnings'] = get_total_earnings(db,current_user)
    total_clicks,c_clicks,l_clicks = get_total_clicks(db,current_user)
    response['overview']['total_clicks'] = total_clicks
    total_purchases,c_purchases,l_purchases = get_total_purchases(db,current_user)
    response['overview']['conversion_rate'] = find_conversion_rate(total_clicks.get('value'),total_purchases,c_purchases,l_purchases,c_clicks,l_clicks)
    response['overview']['total_active_links'] = get_total_active_links(db,current_user)
    response['monthly_earnings'] = get_monthly_earnings(db,current_user)
    response['performance'] = get_click_conversion_week(db,current_user)
    response['products'] = get_all_products(db,current_user,"",page=1,limit=10)
    response['withdraw_history'] =  get_withdraw_history(db,current_user,page=1,limit=10)
    response['withdraw_summary'] =  get_withdraw_summary(db,current_user)
    response['withdraw_account_details'] = get_account_details(db,current_user)
    return response

@router.get('/withdraw-history')
def get_user_dashboard_courses(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    return get_withdraw_history(db,current_user,page,limit)

@router.get('/product-history')
def get_user_dashboard_product_history(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    query:str = Query("")
):
    return get_all_products(db,current_user,query,page,limit)

@router.get("/verify/item/{item_type}/{item_id}",response_model=ItemListResponse)
def get_purchase_by_id(item_type:str,item_id:str,db:Session=Depends(get_db),current_user:User=Depends(is_admin_user)):
    db_item =  get_item_by_id_and_type(db,item_id,item_type)
    if not db_item:
        raise HTTPException(status_code=404,detail="Item not found")
    return ItemListResponse.from_orm(db_item)

@router.get('/verify/user/{user_id}',response_model=UserResponse)
def verify_user(user_id:str,db:Session=Depends(get_db),current_user:User=Depends(is_admin_user)):
    db_user = get_user_by_user_id(db,user_id)
    if not db_user:
        db_user = get_user_by_id(db,user_id)
        if not db_user:
            raise HTTPException(status_code=404,detail="User not found")
    return UserResponse.from_orm(db_user).dict()

@router.get("/all-items")
def get_combined_items(
    db: Session=Depends(get_db),
    page: int = 1,
    size: int = 10,
    search: str = "",
    filter: str = "all",  
):
    search = search.strip()
    filters = []
    if search:
        filters.append(or_(
            Course.title.ilike(f"%{search}%"),
            Course.description.ilike(f"%{search}%")
        ))
        ebook_filters = [or_(
            EBook.title.ilike(f"%{search}%"),
            EBook.description.ilike(f"%{search}%")
        )]
    else:
        filters.append(True)
        ebook_filters = [True]

    items = []

    if filter in ("all", "course"):
        course_query = db.query(Course).filter(Course.visible == True, *filters)
        items += [{
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "price": course.price,
            "commission": course.commission,
            "thumbnail": course.thumbnail,
            "intro_video": course.intro_video,
            "type": "course"
        } for course in course_query]

    if filter in ("all", "ebook"):
        ebook_query = db.query(EBook).filter(EBook.visible == True, *ebook_filters)
        items += [{
            "id": ebook.id,
            "title": ebook.title,
            "description": ebook.description,
            "price": ebook.price,
            "commission": ebook.commission,
            "thumbnail": ebook.thumbnail,
            "intro_video": ebook.intro_video,
            "type": "ebook"
        } for ebook in ebook_query]

    # Sort by created_at descending (you can also sort by type then created_at if needed)
    items.sort(key=lambda x: x.get("created_at", 0), reverse=True)

    total = len(items)
    start = (page - 1) * size
    end = start + size
    paginated = items[start:end]
    admin_user_id = db.query(User).filter(User.is_admin == True).first().user_id
    return   {
        "total": total,
        "limit": size,
        "total_pages": math.ceil(total / size) if size else 1,
        "has_prev": page > 1,
        "has_next": end < total,
        "items": paginated,
        "affiliate_user_id":admin_user_id
    }