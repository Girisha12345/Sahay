from django.urls import path

from support.views import SupportTicketCreateView, SupportTicketListCreateView, SupportTicketListView, SupportTicketUpdateView
from support.views import SupportChatAuditView

urlpatterns = [
    path("", SupportTicketListCreateView.as_view(), name="support-ticket-root"),
    path("tickets/", SupportTicketListView.as_view(), name="support-ticket-list-slash"),
    path("tickets/create/", SupportTicketCreateView.as_view(), name="support-ticket-create-slash"),
    path("tickets/create", SupportTicketCreateView.as_view(), name="support-ticket-create"),
    path("tickets", SupportTicketListView.as_view(), name="support-ticket-list"),
    path("tickets/<int:pk>", SupportTicketUpdateView.as_view(), name="support-ticket-update"),
    path("tickets/<int:ticket_id>/chat/", SupportChatAuditView.as_view(), name="support-chat-audit"),
]
