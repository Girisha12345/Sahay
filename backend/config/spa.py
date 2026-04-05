from pathlib import Path

from django.http import FileResponse, Http404


def serve_spa(_request):
    index_path = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist" / "index.html"
    if not index_path.exists():
        raise Http404("Frontend build not found")
    return FileResponse(index_path.open("rb"), content_type="text/html")
