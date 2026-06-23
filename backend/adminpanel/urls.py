from django.urls import path

from adminpanel.views import (
    ApproveProviderView,
    FlaggedChatsView,
    PendingProvidersView,
    RevenueAnalyticsView,
    RejectProviderView,
    ResolveFlaggedChatView,
    AdminDashboardStatsView,
    AdminRevenueAnalyticsView,
    AdminBookingAnalyticsView,
    AdminProviderAnalyticsView,
    AdminCustomerAnalyticsView,
    AdminPaymentAnalyticsView,
    AdminChatAnalyticsView,
    AdminServiceAnalyticsView,
    AdminReportDownloadView,
)

urlpatterns = [
    path("revenue", RevenueAnalyticsView.as_view(), name="admin-revenue"),
    path("revenue/", RevenueAnalyticsView.as_view(), name="admin-revenue-slash"),
    path("providers/pending", PendingProvidersView.as_view(), name="admin-pending-providers"),
    path("providers/approve", ApproveProviderView.as_view(), name="admin-approve-provider"),
    path("providers/reject/", RejectProviderView.as_view(), name="reject-provider"),
    path("flagged-chats", FlaggedChatsView.as_view(), name="admin-flagged-chats"),
    path("flagged-messages", FlaggedChatsView.as_view(), name="admin-flagged-messages"),
    path("flagged-chats/<int:pk>/resolve", ResolveFlaggedChatView.as_view(), name="admin-resolve-flagged-chat"),
    path("dashboard-stats", AdminDashboardStatsView.as_view(), name="admin-dashboard-stats"),
    path("revenue-analytics", AdminRevenueAnalyticsView.as_view(), name="admin-revenue-analytics"),
    path("booking-analytics", AdminBookingAnalyticsView.as_view(), name="admin-booking-analytics"),
    path("provider-analytics", AdminProviderAnalyticsView.as_view(), name="admin-provider-analytics"),
    path("customer-analytics", AdminCustomerAnalyticsView.as_view(), name="admin-customer-analytics"),
    path("payment-analytics", AdminPaymentAnalyticsView.as_view(), name="admin-payment-analytics"),
    path("chat-moderation-analytics", AdminChatAnalyticsView.as_view(), name="admin-chat-analytics"),
    path("service-analytics", AdminServiceAnalyticsView.as_view(), name="admin-service-analytics"),
    path("reports/download", AdminReportDownloadView.as_view(), name="admin-reports-download"),
]
