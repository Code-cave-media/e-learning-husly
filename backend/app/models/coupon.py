from db.base import Base
from sqlalchemy import Column, String, Float, Integer, Boolean
from .utils import TimestampMixin
class Coupon(TimestampMixin, Base):
    __tablename__ = "coupon"
    id: int = Column(Integer, primary_key=True, index=True)
    type: str = Column(String, default='fixed')
    discount: float = Column(Float)
    min_purchase: float = Column(Float, nullable=True)
    code: str = Column(String, unique=True)
    no_of_access: int = Column(Integer)
    used: int = Column(Integer, default=0)
    def __repr__(self):
        return f"<CouponCode(code={self.code}, discount={self.discount}, type={self.type})>"    