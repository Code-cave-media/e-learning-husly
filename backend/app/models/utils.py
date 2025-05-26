from sqlalchemy import Column, DateTime, func, Integer, String, Boolean, Float, ForeignKey
from db.base import Base
class TimestampMixin:
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class LandingPage(Base):
    __tablename__ = "landing_page"
    id = Column(Integer, primary_key=True, index=True)
    main_heading = Column(String, nullable=False)
    sub_heading = Column(String, nullable=False)
    top_heading = Column(String, nullable=False)
    highlight_words = Column(String, nullable=False)
    thumbnail = Column(String, nullable=False)