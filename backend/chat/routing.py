from django.urls import re_path

from chat.consumers import BookingChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<booking_id>\d+)/$", BookingChatConsumer.as_asgi()),
]
