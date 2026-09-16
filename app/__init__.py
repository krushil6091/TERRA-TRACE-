import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

_backend_app = _backend_dir / "app"
if _backend_app.exists():
    __path__ = [str(_backend_app)]
