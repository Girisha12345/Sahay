from rest_framework import generics, permissions

from services.models import Category, Service
from services.permissions import IsAdminOnly
from services.serializers import CategorySerializer, ServiceSerializer


class CategoryListView(generics.ListAPIView):
	queryset = Category.objects.filter(is_active=True).order_by("name")
	serializer_class = CategorySerializer
	permission_classes = [permissions.AllowAny]


class ServiceListView(generics.ListAPIView):
	queryset = Service.objects.filter(is_active=True).select_related("category")
	serializer_class = ServiceSerializer
	permission_classes = [permissions.AllowAny]
	filterset_fields = ["category__id"]
	search_fields = ["title", "description"]


class ServiceListCreateView(generics.ListCreateAPIView):
	queryset = Service.objects.filter(is_active=True).select_related("category")
	serializer_class = ServiceSerializer
	filterset_fields = ["category__id"]
	search_fields = ["title", "description"]

	def get_permissions(self):
		if self.request.method == "POST":
			return [IsAdminOnly()]
		return [permissions.AllowAny()]


class ServiceDetailView(generics.RetrieveAPIView):
	queryset = Service.objects.filter(is_active=True).select_related("category")
	serializer_class = ServiceSerializer
	permission_classes = [permissions.AllowAny]


