from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.deps import get_current_user
from db.session import get_db
from crud.user_dashboard import *
from fastapi import Query

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