from sqlalchemy import Column, Integer, String, ForeignKey,Float,Boolean
from db.base import Base
from .utils import TimestampMixin


class EBook(TimestampMixin, Base):
    __tablename__ = "e_book"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=True)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    commission = Column(Float)
    pdf = Column(String, nullable=False)  
    thumbnail = Column(String, nullable=True)
    visible = Column(Boolean, default=True)


