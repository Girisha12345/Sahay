from django.urls import path

from chat.views import BookingChatHistoryView

urlpatterns = [
    path("bookings/<int:booking_id>/chat", BookingChatHistoryView.as_view(), name="chat-history"),
]
