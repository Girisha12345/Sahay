from django.urls import path
from rest_framework.routers import DefaultRouter

from reviews.views import ProviderReviewListView, ReviewCreateView, ReviewViewSet

router = DefaultRouter()
router.register(r"", ReviewViewSet, basename="reviews")

urlpatterns = [
    *router.urls,
    path("create", ReviewCreateView.as_view(), name="review-create"),
    path("create/", ReviewCreateView.as_view(), name="review-create-slash"),
    path("provider/", ProviderReviewListView.as_view(), name="provider-reviews"),
    path("provider", ProviderReviewListView.as_view(), name="provider-reviews-no-slash"),
]
