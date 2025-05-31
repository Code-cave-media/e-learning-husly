from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.deps import get_current_user
from db.session import get_db
from crud.user_dashboard import *
from crud.affiliate import *
from fastapi import Query
from crud.affiliate import get_affiliate_account_by_user_id
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
        "total_purchase":get_total_purchases(current_user),
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
    filter: str = Query('all', regex='^(all|my|new|featured)$')
):
    if filter == 'all':
        return get_all_courses(db, current_user, page, limit)
    elif filter == 'my':
        return get_user_purchased_courses(db, current_user, page, limit)
    elif filter == 'new':
        return get_new_courses(db, current_user, page, limit)
    elif filter == 'featured':
        return get_featured_courses(db, current_user,page, limit)
    return []

@router.get('/ebooks')
def get_user_dashboard_ebooks(
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    filter: str = Query('all', regex='^(all|my|new|featured)$')
):
    if filter == 'all':
        return get_all_ebooks(db, current_user, page, limit)
    elif filter == 'my':
        return get_user_purchased_ebooks(db, current_user, page, limit)
    elif filter == 'new':
        return get_new_ebooks(db, current_user, page, limit)
    elif filter == 'featured':
        return get_featured_ebooks(db,current_user, page, limit)
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
    response['overview']['total_earnings'] = get_affiliate_account_by_user_id(db,current_user.id).total_earnings
    total_clicks = get_total_clicks(db,current_user)
    response['overview']['total_clicks'] = total_clicks
    total_purchases = get_total_purchases(db,current_user)
    response['overview']['conversion_rate'] = round((total_purchases / total_clicks) * 100,1)
    response['overview']['total_active_links'] = get_total_active_links(db,current_user)
    return response

