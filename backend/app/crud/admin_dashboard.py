from sqlalchemy.orm import Session
from models.affiliate import AffiliateLink,AffiliateAccount ,AffiliateLinkClick,AffiliateLinkPurchase,Withdraw,UPIDetails,BankDetails
from models.user import User
from datetime import datetime, timedelta
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from schemas.affiliate import  *
from crud.utils import to_pagination_response
from schemas.user import UserResponse
from models.course import Course
from models.ebook import EBook
from models.purchase import Purchase
def get_total_users(db: Session) -> int:
    return db.query(User).count()

def get_total_courses(db: Session) -> int:
    return db.query(Course).count()
def get_total_ebooks(db: Session) -> int:
    return db.query(EBook).count()
def get_total_sales(db: Session) -> int:
    count =  db.query(Purchase).count()
    purchases = db.query(Purchase).all()
    total_amount = 0
    for purchase in purchases:
        if purchase.item_type == 'course':
            db_course = db.query(Course).filter(Course.id == purchase.item_id).first()
            if db_course:
                total_amount += db_course.price 
        elif purchase.item_type == 'ebook':
            db_ebook = db.query(EBook).filter(EBook.id == purchase.item_id).first()
            if db_ebook:
                total_amount += db_ebook.price
    return {
        "count": count,
        "total_amount": total_amount
    }
def get_total_withdrawals_by_status(db: Session, status: str) -> dict:
    if status not in ['success', 'pending', '']:
        raise ValueError("Invalid status. Use 'success', 'pending', or '' for all withdrawals.")

    query = db.query(
        func.count(Withdraw.id),
        func.coalesce(func.sum(Withdraw.amount), 0)
    )

    if status:
        query = query.filter(Withdraw.status == status)

    count, total_amount = query.one()

    return {
        "count": count,
        "total_amount": total_amount
    }


from sqlalchemy import extract

def get_total_sales_by_month_last_year(db: Session) -> list:
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=365)

    purchases = db.query(
        extract('year', Purchase.created_at).label('year'),
        extract('month', Purchase.created_at).label('month')
    ).filter(
        Purchase.created_at >= start_date,
        Purchase.created_at <= end_date
    ).group_by('year', 'month').all()

    # Create keys like '2024-07'
    sales_data = {
        f"{int(purchase.year):04d}-{int(purchase.month):02d}": 0
        for purchase in purchases
    }

    for purchase in db.query(Purchase).filter(
        Purchase.created_at >= start_date,
        Purchase.created_at <= end_date
    ).all():
        month_str = purchase.created_at.strftime('%Y-%m')
        if purchase.item_type == 'course':
            db_course = db.query(Course).filter(Course.id == purchase.item_id).first()
            if db_course:
                sales_data[month_str] = sales_data.get(month_str, 0) + db_course.price
        elif purchase.item_type == 'ebook':
            db_ebook = db.query(EBook).filter(EBook.id == purchase.item_id).first()
            if db_ebook:
                sales_data[month_str] = sales_data.get(month_str, 0) + db_ebook.price

    result = []
    for i in range(12):
        month = (end_date - timedelta(days=i * 30)).strftime('%Y-%m')
        result.append({
            "month": month,
            "sales": sales_data.get(month, 0)
        })

    return result[::-1]  # reverse to show oldest month first

