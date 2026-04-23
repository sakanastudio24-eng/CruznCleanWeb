from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def health_check() -> dict[str, str]:
    """Returns a lightweight service health status payload."""
    return {"status": "ok"}
