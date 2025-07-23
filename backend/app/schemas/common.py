from pydantic import BaseModel
from typing import Generic, List, TypeVar, Optional
from typing import Any,List
from pydantic.generics import GenericModel
T = TypeVar("T")
class Pagination(BaseModel):
  page : int
  size: int
  search:str | None = None

class PaginationResponse(GenericModel, Generic[T]):
  has_next:bool
  has_prev:bool
  total:int
  items:List[T]