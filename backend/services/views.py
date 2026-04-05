from django.db.models import Q
from rest_framework import generics, permissions

from services.models import Category, Service
from services.permissions import IsAdminOnly
from services.serializers import CategorySerializer, ServiceSerializer


def expand_service_search_terms(query: str) -> list[str]:
	query = query.lower().strip()
	terms = {query}
	for fragment in query.split():
		terms.add(fragment)

	synonyms = {
		"plumber": {"plumbing", "plumb", "pipe"},
		"plumbing": {"plumber", "pipe"},
		"cleaning": {"clean", "cleaner", "deep clean"},
		"clean": {"cleaning", "cleaner", "deep clean"},
		"tutor": {"tuition", "education", "coaching"},
		"tutoring": {"tutor", "tuition", "education"},
		"electrician": {"electrical", "electric", "wiring"},
		"beauty": {"salon", "grooming"},
	}

	for term in list(terms):
		terms.update(synonyms.get(term, set()))

	return [term for term in terms if term]


def filter_services_queryset(queryset, request):
	search = request.query_params.get("search", "").strip()
	category_id = request.query_params.get("category") or request.query_params.get("category__id")

	if category_id:
		queryset = queryset.filter(category__id=category_id)

	if search:
		terms = expand_service_search_terms(search)
		search_query = Q()
		for term in terms:
			search_query |= (
				Q(title__icontains=term)
				| Q(description__icontains=term)
				| Q(category__name__icontains=term)
			)
		queryset = queryset.filter(search_query).distinct()

	return queryset


class CategoryListView(generics.ListAPIView):
	queryset = Category.objects.filter(is_active=True).order_by("name")
	serializer_class = CategorySerializer
	permission_classes = [permissions.AllowAny]


class ServiceListView(generics.ListAPIView):
	queryset = Service.objects.filter(is_active=True).select_related("category")
	serializer_class = ServiceSerializer
	permission_classes = [permissions.AllowAny]
	filter_backends = []

	def get_queryset(self):
		return filter_services_queryset(super().get_queryset(), self.request)


class ServiceListCreateView(generics.ListCreateAPIView):
	queryset = Service.objects.filter(is_active=True).select_related("category")
	serializer_class = ServiceSerializer
	filter_backends = []

	def get_queryset(self):
		return filter_services_queryset(super().get_queryset(), self.request)

	def get_permissions(self):
		if self.request.method == "POST":
			return [IsAdminOnly()]
		return [permissions.AllowAny()]


class ServiceDetailView(generics.RetrieveAPIView):
	queryset = Service.objects.filter(is_active=True).select_related("category")
	serializer_class = ServiceSerializer
	permission_classes = [permissions.AllowAny]


