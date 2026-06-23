import logging
import traceback

from django.conf import settings
from django.http import JsonResponse

logger = logging.getLogger(__name__)


class GlobalExceptionMiddleware:
    """Return consistent JSON errors for unhandled exceptions."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        logger.exception(
            "Unhandled API exception: %s %s - %s",
            request.method,
            request.path,
            str(exception),
        )
        
        error_detail = "An unexpected error occurred."
        tb = None
        if settings.DEBUG:
            # In development, include the actual error message and traceback
            error_detail = str(exception)
            tb = traceback.format_exc()
            print(f"ERROR: {request.method} {request.path}")
            print(tb)
        
        return JsonResponse(
            {
                "detail": error_detail,
                "traceback": tb if settings.DEBUG else None,
            },
            status=500,
        )
