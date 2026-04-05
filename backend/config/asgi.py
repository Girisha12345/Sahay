import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

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
