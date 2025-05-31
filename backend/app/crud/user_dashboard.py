from sqlalchemy.orm import Session
from models.user import User
from models.course import Course,CourseProgress
from models.ebook import EBook
from models.user import User
from models.purchase import Purchase
from schemas.course import CourseListResponse
from schemas.ebook import EbookListResponse
from crud.affiliate import get_affiliate_link_by_all
from crud.affiliate import AffiliateAccount

def get_user_purchased_course_and_ebook(db: Session, user: User,page: int = 1, limit: int = 10):
    user_purchases = user.purchases
    res = []
    for purchase in user_purchases:
        if purchase.item_type == 'course':
            course = db.query(Course).filter(Course.id == purchase.item_id).first()
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
            ebook = db.query(EBook).filter(EBook.id == purchase.item_id).first()
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
            course = db.query(Course).filter(Course.id == purchase.item_id).first()
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
            ebook = db.query(EBook).filter(EBook.id == purchase.item_id).first()
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

def get_total_purchases(user: User):
    return len(user.purchases)

def get_total_progressing_courses(db:Session,user: User):
    purchases = user.purchases
    res = 0
    for purchase in purchases:
        if purchase.item_type == 'course':
            course = db.query(CourseProgress).filter(
                CourseProgress.user_id == user.id,
                CourseProgress.course_id == purchase.item_id,
                CourseProgress.completed == True
            ).first()
            res += 0 if course else 1
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

