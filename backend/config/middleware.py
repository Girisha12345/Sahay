import logging

from django.http import JsonResponse

logger = logging.getLogger(__name__)


class GlobalExceptionMiddleware:
    """Return consistent JSON errors for unhandled exceptions."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        logger.exception("Unhandled API exception", exc_info=exception)
        return JsonResponse(
            {
                "detail": "An unexpected error occurred.",
            },
            status=500,
        )
