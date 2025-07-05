from .auth         import router as auth_router
from .common_sense import router as common_sense_router
from .votes        import router as votes_router
from .users        import router as users_router

__all__ = [
  "auth_router",
  "common_sense_router",
  "votes_router",
  "users_router",
]