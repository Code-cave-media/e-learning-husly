from pydantic import BaseModel
from typing import Any,List
class Pagination(BaseModel):
  page : int

class PaginationResponse(BaseModel):
  has_next:bool
  has_prev:bool
  total:int
  data:List[Any]