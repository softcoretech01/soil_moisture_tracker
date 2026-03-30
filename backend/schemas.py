from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "User"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

class User(BaseModel):
    user_id: int
    username: str
    role: str

class FieldCreate(BaseModel):
    field_name: str
    description: Optional[str] = None

class FieldUpdate(BaseModel):
    field_name: Optional[str] = None
    description: Optional[str] = None

class Field(BaseModel):
    field_id: int
    field_name: str
    description: Optional[str] = None

class MoistureLogCreate(BaseModel):
    field_id: int
    log_date: date
    moisture_level: float
    user_id: int

class MoistureLog(BaseModel):
    log_id: Optional[int] = None
    field_id: int
    field_name: Optional[str] = None
    log_date: date
    moisture_level: float
    user_id: int

class AnalyticsReport(BaseModel):
    field_id: int
    field_name: str
    average_moisture: float
    total_logs: int
