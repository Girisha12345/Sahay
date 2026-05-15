from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken

from config.authentication import ActiveUserJWTAuthentication


@database_sync_to_async
def get_user_from_token(token):
    try:
        validated_token = UntypedToken(token)
        jwt_auth = ActiveUserJWTAuthentication()
        user = jwt_auth.get_user(validated_token)
        return user
    except (InvalidToken, TokenError, Exception):
        return AnonymousUser()


class JwtAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = None
        if params.get("token"):
            token = params["token"][0]

        scope["user"] = await get_user_from_token(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(inner)
