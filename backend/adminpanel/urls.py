from django.urls import path

from adminpanel.views import (
    ApproveProviderView,
    FlaggedChatsView,
    PendingProvidersView,
    RevenueAnalyticsView,
)

urlpatterns = [
    path("revenue", RevenueAnalyticsView.as_view(), name="admin-revenue"),
    path("revenue/", RevenueAnalyticsView.as_view(), name="admin-revenue-slash"),
    path("providers/pending", PendingProvidersView.as_view(), name="admin-pending-providers"),
    path("providers/approve", ApproveProviderView.as_view(), name="admin-approve-provider"),
    path("flagged-chats", FlaggedChatsView.as_view(), name="admin-flagged-chats"),
    path("flagged-messages", FlaggedChatsView.as_view(), name="admin-flagged-messages"),
]
