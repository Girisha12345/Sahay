from django.urls import path

from notifications.views import NotificationListView, NotificationMarkReadView

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications-list"),
    path("<int:pk>/read/", NotificationMarkReadView.as_view(), name="notifications-mark-read"),
]
