from sqlalchemy import Column, Integer, String, ForeignKey,Float,Boolean
from db.base import Base
from sqlalchemy.orm import relationship
from .utils import TimestampMixin

class CourseLandingPage(TimestampMixin,Base):
    __tablename__ = "course_landing_page"
    id = Column(Integer, primary_key=True, index=True)
    main_heading = Column(String, nullable=False)
    sub_heading = Column(String, nullable=False)
    top_heading = Column(String, nullable=False)
    highlight_words = Column(String, nullable=False)
    thumbnail = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("course.id"), unique=True)
class Course(TimestampMixin,Base):
    __tablename__ = "course"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    price = Column(Float)
    commission = Column(Float)
    visible = Column(Boolean,default=True)
    intro_video = Column(String)
    thumbnail = Column(String)
    chapters = relationship("CourseChapter", backref="course", cascade="all, delete-orphan")
    landing_page = relationship("CourseLandingPage", backref="course", uselist=False)


class CourseChapter(TimestampMixin,Base):
    __tablename__ = "course_chapter"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"))
    video = Column(String)
    title = Column(String)
    description = Column(String)
    duration = Column(String)
    pdf = Column(String, nullable=True)

class CouponCode(TimestampMixin,Base):
    __tablename__ = "coupon_code"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String,default='fixed')
    discount = Column(Float)
    min_purchase = Column(Float,nullable=True)
    code = Column(String, unique=True)
    no_of_use = Column(Integer)

