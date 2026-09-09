import os
from datetime import UTC, datetime

from fastapi import HTTPException, status
from openai import AsyncOpenAI

from app.schemas import DumpResponse, LLMLogOutput

SYSTEM_PROMPT = """あなたは無機質なサーバー監視システムです。ユーザーの入力を解析し、感情的な慰めを一切排除した冷徹なシステムステータスを出力してください。
形式は、正常なら[INFO]、疲労やストレスがあれば[WARN]、睡眠不足など致命的エラーなら[CRITICAL]としてください。"""

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _client


async def convert_note_to_log(user_note: str) -> DumpResponse:
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    try:
        completion = await _get_client().beta.chat.completions.parse(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_note},
            ],
            response_format=LLMLogOutput,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM inference failed",
        ) from exc

    parsed = completion.choices[0].message.parsed
    if parsed is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LLM returned invalid structured output",
        )

    return DumpResponse(
        level=parsed.level,
        message=parsed.message,
        timestamp=datetime.now(UTC),
    )
