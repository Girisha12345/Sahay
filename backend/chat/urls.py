from django.urls import path

from chat.views import BookingChatHistoryView, ChatSendMessageView

urlpatterns = [
    path("chat/<int:booking_id>/", BookingChatHistoryView.as_view(), name="chat-history-root"),
    path("chat/send/", ChatSendMessageView.as_view(), name="chat-send-message-root"),
    path("bookings/<int:booking_id>/chat", BookingChatHistoryView.as_view(), name="chat-history"),
    path("bookings/<int:booking_id>/chat/", BookingChatHistoryView.as_view(), name="chat-history-slash"),
    path("messages", BookingChatHistoryView.as_view(), name="chat-messages"),
    path("messages/", BookingChatHistoryView.as_view(), name="chat-messages-slash"),
    path("send-message", ChatSendMessageView.as_view(), name="chat-send-message"),
    path("send-message/", ChatSendMessageView.as_view(), name="chat-send-message-slash"),
]
