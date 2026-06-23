from django.db.models import Q
from rest_framework import filters, generics, permissions, status
from rest_framework.response import Response

from accounts.permissions import IsAdminRole, IsProviderRole
from services.models import Category, Service
from services.serializers import CategorySerializer, ProviderServiceSerializer, PublicServiceSerializer


class PublicCategoryListView(generics.ListAPIView):
	serializer_class = CategorySerializer
	permission_classes = [permissions.AllowAny]
	queryset = Category.objects.filter(is_active=True).order_by("name")


class PublicServiceListView(generics.ListAPIView):
	serializer_class = PublicServiceSerializer
	permission_classes = [permissions.AllowAny]
	filter_backends = [filters.SearchFilter]
	search_fields = ["title", "description"]

	def get_queryset(self):
		# Show all services that are active (regardless of provider verification status)
		qs = Service.objects.filter(is_active=True).select_related("category", "provider")

		category = self.request.query_params.get("category")
		if category:
			if str(category).isdigit():
				qs = qs.filter(category_id=category)
			else:
				qs = qs.filter(category__name__iexact=category)

		return qs.order_by("-created_at")


class PublicServiceDetailView(generics.RetrieveAPIView):
	serializer_class = PublicServiceSerializer
	permission_classes = [permissions.AllowAny]
	queryset = Service.objects.filter(is_active=True).select_related("category", "provider")


class ProviderMyServiceListCreateView(generics.ListCreateAPIView):
	serializer_class = ProviderServiceSerializer
	permission_classes = [permissions.IsAuthenticated, IsProviderRole]

	def get_queryset(self):
		if getattr(self, "swagger_fake_view", False) or getattr(self.request.user, "is_anonymous", True):
			return Service.objects.none()
		return Service.objects.filter(provider=self.request.user).select_related("category", "provider").order_by("-created_at")

	def perform_create(self, serializer):
		serializer.save(provider=self.request.user)


class ProviderMyServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = ProviderServiceSerializer
	permission_classes = [permissions.IsAuthenticated, IsProviderRole]

	def get_queryset(self):
		if getattr(self, "swagger_fake_view", False) or getattr(self.request.user, "is_anonymous", True):
			return Service.objects.none()
		return Service.objects.filter(provider=self.request.user).select_related("category", "provider")


class ProviderMyServiceToggleActiveView(generics.GenericAPIView):
	serializer_class = ProviderServiceSerializer
	permission_classes = [permissions.IsAuthenticated, IsProviderRole]
	queryset = Service.objects.all()

	def post(self, request, pk):
		service = Service.objects.filter(pk=pk, provider=request.user).first()
		if not service:
			return Response({"detail": "Service not found."}, status=status.HTTP_404_NOT_FOUND)

		service.is_active = not service.is_active
		service.save(update_fields=["is_active", "updated_at"])
		return Response(ProviderServiceSerializer(service).data, status=status.HTTP_200_OK)


class AdminServiceModerationView(generics.RetrieveUpdateAPIView):
	serializer_class = ProviderServiceSerializer
	permission_classes = [permissions.IsAuthenticated, IsAdminRole]
	queryset = Service.objects.all().select_related("category", "provider")


class LegacyServiceSearchView(generics.ListAPIView):
	serializer_class = PublicServiceSerializer
	permission_classes = [permissions.AllowAny]

	def get_queryset(self):
		q = self.request.query_params.get("q", "").strip()
		qs = Service.objects.filter(is_active=True).select_related("category", "provider")
		if q:
			qs = qs.filter(
				Q(title__icontains=q)
				| Q(description__icontains=q)
				| Q(category__name__icontains=q)
			)
		return qs.order_by("-created_at")


