import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()
try:
	# initialize sentry if configured
	from config.sentry import init_sentry

	init_sentry()
except Exception:
	pass

import chat.routing
import notifications.routing
from config.jwt_middleware import JwtAuthMiddlewareStack

application = ProtocolTypeRouter(
	{
		'http': django_asgi_app,
		'websocket': JwtAuthMiddlewareStack(
			URLRouter(
				chat.routing.websocket_urlpatterns + notifications.routing.websocket_urlpatterns
			)
		),
	}
)
