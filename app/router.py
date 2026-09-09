from fastapi import APIRouter

from app.schemas import DumpRequest, DumpResponse
from app.services import convert_note_to_log

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.post("/dump", response_model=DumpResponse)
async def dump_log(body: DumpRequest) -> DumpResponse:
    return await convert_note_to_log(body.user_note)
