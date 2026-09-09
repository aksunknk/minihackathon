from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class LogLevel(str, Enum):
    INFO = "INFO"
    WARN = "WARN"
    CRITICAL = "CRITICAL"


class DumpRequest(BaseModel):
    user_note: str = Field(..., min_length=1, description="ユーザー入力の日記・思考")


class LLMLogOutput(BaseModel):
    level: LogLevel
    message: str = Field(..., min_length=1)


class DumpResponse(BaseModel):
    level: LogLevel
    message: str
    timestamp: datetime
