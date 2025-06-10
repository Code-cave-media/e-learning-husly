from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.user import User
from models.course import Course,CourseProgress
from models.ebook import EBook
from models.user import User
from models.purchase import Purchase
from schemas.course import CourseListResponse
from schemas.ebook import EbookListResponse
from crud.affiliate import get_affiliate_link_by_all
from crud.affiliate import AffiliateAccount
from models.affiliate import AffiliateLinkPurchase,AffiliateLinkClick
from datetime import datetime, timedelta
from sqlalchemy import func
from crud.purchase import get_item_by_id_and_type
from models.affiliate import Withdraw
from schemas.affiliate import WithdrawResponse
from datetime import datetime, timedelta, timezone
from crud.affiliate import get_affiliate_account_by_id
from sqlalchemy import desc  # if you want descending order
from crud.utils import to_pagination_response
from models.affiliate import UPIDetails,BankDetails
from schemas.affiliate import UPIDetailsResponse,BankAccountResponse
from crud.course import get_or_create_course_progress

def get_user_purchased_course_and_ebook(db: Session, user: User,page: int = 1, limit: int = 10):
    user_purchases = user.purchases
    res = []
    for purchase in user_purchases:
        if purchase.item_type == 'course':
            course = db.query(Course).filter(Course.id == purchase.item_id,Course.visible==True).first()
            if course:
                course_data = CourseListResponse.from_orm(course).dict()
                course_data['type'] = 'course'
                course_data['purchased_at'] = purchase.created_at
                course_data['is_purchased'] = True
                course_data['has_affiliate_link'] = get_affiliate_link_by_all(
                    db, user.id, course.id, 'course'
                ) is not None

                res.append(course_data)
        elif purchase.item_type == 'ebook':
            ebook = db.query(EBook).filter(EBook.id == purchase.item_id,EBook.visible==True).first()
            if ebook:
                ebook_data = EbookListResponse.from_orm(ebook).dict()
                ebook_data['type'] = 'ebook'
                ebook_data['purchased_at'] = purchase.created_at
                ebook_data['is_purchased'] = True
                ebook_data['has_affiliate_link'] = get_affiliate_link_by_all(
                    db, user.id, ebook.id, 'ebook'
                ) is not None
                res.append(ebook_data)
    # sort by purchased_at date
    res.sort(key=lambda x:x['purchased_at'], reverse=True)
    # pagination
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end] 
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_user_purchased_courses(db: Session, user: User, page: int = 1, limit: int = 10):
    user_purchases = user.purchases
    res = []
    for purchase in user_purchases:
        if purchase.item_type == 'course':
            course = db.query(Course).filter(Course.id == purchase.item_id,Course.visible==True).first()
            if course:
                course_data = CourseListResponse.from_orm(course).dict()
                course_data['type'] = 'course'
                course_data['purchased_at'] = purchase.created_at
                course_data['is_purchased'] = True
                course_data['has_affiliate_link'] = get_affiliate_link_by_all(
                    db, user.id, course.id, 'course'
                ) is not None
                res.append(course_data)
    # sort by purchased_at date
    res.sort(key=lambda x:x['purchased_at'], reverse=True)
    # pagination
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end] 
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_user_purchased_ebooks(db: Session, user: User, page: int = 1, limit: int = 10):
    user_purchases = user.purchases
    res = []
    for purchase in user_purchases:
        if purchase.item_type == 'ebook':
            ebook = db.query(EBook).filter(EBook.id == purchase.item_id,EBook.visible==True).first()
            if ebook:
                ebook_data = EbookListResponse.from_orm(ebook).dict()
                ebook_data['type'] = 'ebook'
                ebook_data['purchased_at'] = purchase.created_at
                ebook_data['is_purchased'] = True
                ebook_data['has_affiliate_link'] = get_affiliate_link_by_all(
                    db, user.id, ebook.id, 'ebook'
                ) is not None
                res.append(ebook_data)
    # sort by purchased_at date
    res.sort(key=lambda x:x['purchased_at'], reverse=True)
    # pagination
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end] 
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_total_user_purchases(user: User):
    return len(user.purchases)

def get_total_progressing_courses(db:Session,user: User):
    purchases = user.purchases
    res = 0
    for purchase in purchases:
        if purchase.item_type == 'course':
            course_progress = db.query(CourseProgress).filter(
                CourseProgress.user_id == user.id,
                CourseProgress.course_id == purchase.item_id,
            ).first()
            course = db.query(Course).filter(
                Course.id == purchase.item_id,
                Course.visible == True
            ).first()
            if (len(course_progress.chapters) != len(course.chapters)):
                res += 1
    return res

def get_total_purchased_ebooks(user: User):
    purchases = user.purchases
    res = 0
    for purchase in purchases:
        if purchase.item_type == 'ebook':
            res += 1
    return res

def get_total_purchased_courses(user: User):
    purchases = user.purchases
    res = 0
    for purchase in purchases:
        if purchase.item_type == 'course':
            res += 1
    return res

def get_all_courses(db: Session,user:User, page: int = 1, limit: int = 10):
    courses = db.query(Course).all()
    res = []
    for course in courses:
        if not course.visible:
            continue
        course_data = CourseListResponse.from_orm(course).dict()
        course_data['type'] = 'course'
        if db.query(Purchase).filter(
            Purchase.item_type == 'course',
            Purchase.item_id == course.id,
            Purchase.purchased_user_id == user.id
        ).first():
            course_data['is_purchased'] = True
        course_data['has_affiliate_link'] = get_affiliate_link_by_all(
            db, user.id, course.id, 'course'
        ) is not None
        res.append(course_data)
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end] 
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_new_courses(db: Session,user:User, page: int = 1, limit: int = 10):   
    courses = db.query(Course).filter(
        Course.is_new == True
    ).all()
    res = []
    for course in courses:
        if not course.visible:
            continue
        course_data = CourseListResponse.from_orm(course).dict()
        course_data['type'] = 'course'
        if db.query(Purchase).filter(
            Purchase.item_type == 'course',
            Purchase.item_id == course.id,
            Purchase.purchased_user_id == user.id
        ).first():
            course_data['is_purchased'] = True
        course_data['has_affiliate_link'] = get_affiliate_link_by_all(
            db, user.id, course.id, 'course'
        ) is not None
        res.append(course_data)
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end] 
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_featured_courses(db: Session,user:User, page: int = 1, limit: int = 10):   
    courses = db.query(Course).filter(
        Course.is_featured == True
    ).all()
    res = []
    for course in courses:
        if not course.visible:
            continue
        course_data = CourseListResponse.from_orm(course).dict()
        course_data['type'] = 'course'
        if db.query(Purchase).filter(
            Purchase.item_type == 'course',
            Purchase.item_id == course.id,
            Purchase.purchased_user_id == user.id
        ).first():
            course_data['is_purchased'] = True
        course_data['has_affiliate_link'] = get_affiliate_link_by_all(
            db, user.id, course.id, 'course'
        ) is not None
        res.append(course_data)
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end] 
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_all_ebooks(db: Session, user: User, page: int = 1, limit: int = 10):
    ebooks = db.query(EBook).all()
    res = []
    for ebook in ebooks:
        if not ebook.visible:
            continue
        ebook_data = EbookListResponse.from_orm(ebook).dict()
        ebook_data['type'] = 'ebook'
        if db.query(Purchase).filter(
            Purchase.item_type == 'ebook',
            Purchase.item_id == ebook.id,
            Purchase.purchased_user_id == user.id
        ).first():
            ebook_data['is_purchased'] = True
        ebook_data['has_affiliate_link'] = get_affiliate_link_by_all(
            db, user.id, ebook.id, 'ebook')
        res.append(ebook_data)
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end]
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_new_ebooks(db: Session, user: User, page: int = 1, limit: int = 10):
    ebooks = db.query(EBook).filter(EBook.is_new == True).all()
    res = []
    for ebook in ebooks:
        if not ebook.visible:
            continue
        ebook_data = EbookListResponse.from_orm(ebook).dict()
        ebook_data['type'] = 'ebook'
        if db.query(Purchase).filter(
            Purchase.item_type == 'ebook',
            Purchase.item_id == ebook.id,
            Purchase.purchased_user_id == user.id
        ).first():
            ebook_data['is_purchased'] = True
        ebook_data['has_affiliate_link'] = get_affiliate_link_by_all(
            db, user.id, ebook.id, 'ebook')
        res.append(ebook_data)
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end]
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_featured_ebooks(db: Session, user: User, page: int = 1, limit: int = 10):
    ebooks = db.query(EBook).filter(EBook.is_featured == True).all()
    res = []
    for ebook in ebooks:    
        if not ebook.visible:
            continue
        ebook_data = EbookListResponse.from_orm(ebook).dict()
        ebook_data['type'] = 'ebook'
        if db.query(Purchase).filter(
            Purchase.item_type == 'ebook',
            Purchase.item_id == ebook.id,
            Purchase.purchased_user_id == user.id
        ).first():
            ebook_data['is_purchased'] = True
        ebook_data['has_affiliate_link'] = get_affiliate_link_by_all(
            db, user.id, ebook.id, 'ebook')
        res.append(ebook_data)
    total = len(res)
    start = (page - 1) * limit
    end = start + limit
    paginated_items = res[start:end]
    return {
        "has_prev": page > 1,
        "has_next": end < total,
        "total": total,
        "items": paginated_items
    }

def get_monthly_earnings(db: Session, user: User):
    link_ids = [link.id for link in user.affiliate_links]
    if not link_ids:
        return []

    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    current_date = datetime.utcnow()

    # Raw query results grouped by year and month
    results = db.query(
        func.extract('year', AffiliateLinkPurchase.created_at).label('year'),
        func.extract('month', AffiliateLinkPurchase.created_at).label('month'),
        func.sum(AffiliateLinkPurchase.amount).label('earnings')
    ).filter(
        AffiliateLinkPurchase.link_id.in_(link_ids),
        AffiliateLinkPurchase.created_at >= twelve_months_ago
    ).group_by('year', 'month').order_by('year', 'month').all()

    # Build a dictionary of month -> earnings
    earnings_map = {
        f"{int(row.year):04d}-{int(row.month):02d}": float(row.earnings)
        for row in results
    }

    # Build list of last 12 months in format YYYY-MM
    monthly_earnings = []
    for i in range(12):
        month_date = current_date - timedelta(days=i * 30)  # Approximate each month as 30 days
        year_month = month_date.strftime("%Y-%m")
        monthly_earnings.append({
            "month": year_month,
            "earnings": earnings_map.get(year_month, 0.0)
        })

    # Ensure list is ordered from oldest to newest
    monthly_earnings.reverse()

    return monthly_earnings

def get_click_conversion_week(db: Session, user: User):
    link_ids = [link.id for link in user.affiliate_links]
    last_week = datetime.utcnow() - timedelta(days=7)
    current_date = datetime.utcnow()

    purchases = db.query(
        func.extract('day', AffiliateLinkPurchase.created_at).label('day'),
        func.extract('year', AffiliateLinkPurchase.created_at).label('year'),
        func.extract('month', AffiliateLinkPurchase.created_at).label('month'),
        func.count(AffiliateLinkPurchase.amount).label('purchases'),
        func.sum(AffiliateLinkPurchase.amount).label('earnings')
    ).filter(
        AffiliateLinkPurchase.link_id.in_(link_ids),
        AffiliateLinkPurchase.created_at >= last_week
    ).group_by('year', 'month', 'day').order_by('year', 'month', 'day').all()

    purchases_dict = {
        f"{int(p.year):04d}-{int(p.month):02d}-{int(p.day):02d}": {
            "purchases": p.purchases,
            "earnings": p.earnings
        } for p in purchases
    }

    clicks = db.query(
        func.extract('day', AffiliateLinkClick.created_at).label('day'),
        func.extract('month', AffiliateLinkClick.created_at).label('month'),
        func.extract('year', AffiliateLinkClick.created_at).label('year'),
        func.count(AffiliateLinkClick.id).label('clicks')
    ).filter(
        AffiliateLinkClick.link_id.in_(link_ids),
        AffiliateLinkClick.created_at >= last_week
    ).group_by('year', 'month', 'day').order_by('year', 'month', 'day').all()

    clicks_dict = {
        f"{int(c.year):04d}-{int(c.month):02d}-{int(c.day):02d}": c.clicks for c in clicks
    }

    this_week_performance = []
    for i in range(6, -1, -1):  # last 7 days including today
        day_date = current_date - timedelta(days=i)
        full_date = day_date.strftime("%Y-%m-%d")  # ✅ ISO format

        clicks = clicks_dict.get(full_date, 0)
        purchases_data = purchases_dict.get(full_date, {"purchases": 0, "earnings": 0})
        conversions = (purchases_data["purchases"] / clicks * 100) if clicks else 0.0

        this_week_performance.append({
            "date": full_date,
            "clicks": clicks,
            "conversions": conversions,
            "earnings": purchases_data["earnings"],
            "purchases": purchases_data["purchases"]
        })

    return this_week_performance

def get_all_products(db: Session, user: User,query:str, page: int = 1, limit: int = 10):
    links = user.affiliate_links
    total = len(links)
    start = (page - 1) * limit
    end = start + limit
    sliced_links = links[start:end]
    products = []
    for link in sliced_links:
        db_item = get_item_by_id_and_type(db, link.item_id, link.item_type)
        if  not(db_item and (not query or query.lower() in db_item.title.lower())):
            continue
        total_clicks = len(link.clicks)
        total_purchase = len(link.purchases)
        total_earnings = sum(purchase.amount for purchase in link.purchases)
        conversions = (total_purchase / total_clicks) * 100 if total_clicks else 0

        products.append({
            "id": link.id,
            "name": db_item.title if db_item else "Unknown",
            "clicks": total_clicks,
            "conversions": round(conversions, 2),
            "earnings": round(total_earnings, 2),
            "item_type": link.item_type,
            "item_id": link.item_id,
        })

    total_pages = (total + limit - 1) // limit

    return {
        "items": products,
        "has_next": page < total_pages,
        "has_prev": page > 1,
        "total": total,
        "total_pages": total_pages,
    }

def get_withdraw_history(db:Session,user:User,page=10,limit=10):
    query = db.query(Withdraw).filter(Withdraw.user_id == user.id).order_by(desc(Withdraw.created_at))
    histories = to_pagination_response(query,WithdrawResponse,page,limit)
    return histories

def get_withdraw_summary(db: Session, user: User):
    # Get affiliate account of the user
    affiliate_account = db.query(AffiliateAccount).filter_by(user_id=user.id).first()

    # Total withdrawn = sum of all completed withdraws
    total_withdrawn = db.query(func.coalesce(func.sum(Withdraw.amount), 0)).filter(
        Withdraw.user_id == user.id,
        Withdraw.status == 'success'
    ).scalar()

    # Pending withdraws = sum of all pending withdraws
    pending_withdraw = db.query(func.coalesce(func.sum(Withdraw.amount), 0)).filter(
        Withdraw.user_id == user.id,
        or_(
            Withdraw.status == 'pending',
            Withdraw.status == 'failed'
        )
    ).scalar()

    total_earnings = affiliate_account.total_earnings if affiliate_account else 0
    balance = affiliate_account.balance

    return {
        "total_withdrawn": total_withdrawn,
        "pending_withdraw": pending_withdraw,
        "balance": balance
    }

def get_account_details(db:Session,user:User):
    affiliate_account = db.query(AffiliateAccount).filter_by(user_id=user.id).first()
    if not affiliate_account:
        return None
    upi = db.query(UPIDetails).filter_by(account_id=affiliate_account.id).first()
    bank = db.query(BankDetails).filter_by(account_id=affiliate_account.id).first()
    return {
        "upi_details": UPIDetailsResponse.from_orm(upi).dict() if upi else None,
        "bank_details": BankAccountResponse.from_orm(bank).dict() if bank else None
    }

