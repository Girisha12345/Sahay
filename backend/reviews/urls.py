from django.urls import path

from reviews.views import ProviderReviewListView, ReviewCreateView

urlpatterns = [
    path("create", ReviewCreateView.as_view(), name="review-create"),
    path("provider/<uuid:id>", ProviderReviewListView.as_view(), name="provider-reviews"),
]
