from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.deps import get_current_user
from db.session import get_db
from crud.admin_dashboard import *
from fastapi import Query
from core.deps import is_admin_user
from schemas.course import ItemListResponse
from crud.auth import get_user_by_user_id,get_user_by_id
from schemas.user import UserResponse
router = APIRouter()


@router.get('/dashboard')
def get_dashboard(db:Session=Depends(get_db),current_user:User=Depends(is_admin_user)):
    
    response = {
        "overview":{},
        "line_graph":{},
        "withdrawals":{},
    }
    response['overview']['total_users'] = get_total_users(db)
    response['overview']['total_courses'] = get_total_courses(db)
    response['overview']['total_ebooks'] =  get_total_ebooks(db)
    response['overview']['total_sales'] = get_total_sales(db)
    response['withdrawals']['total_paid_withdrawals'] = get_total_withdrawals_by_status(db,'success')
    response['withdrawals']['total_pending_withdrawals'] = get_total_withdrawals_by_status(db,'pending')
    response['withdrawals']['total_withdrawals'] = get_total_withdrawals_by_status(db,'')
    response['line_graph']['total_users'] = get_total_sales_by_month_last_year(db)
    return response
