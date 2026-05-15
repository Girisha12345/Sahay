from rest_framework import generics, permissions

from addresses.models import Address
from addresses.serializers import AddressCreateSerializer, AddressSerializer


class AddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # during schema generation or when anonymous, return empty queryset
        if getattr(self, "swagger_fake_view", False) or getattr(self.request.user, "is_anonymous", True):
            return Address.objects.none()
        return Address.objects.filter(user=self.request.user).order_by("-is_default", "-updated_at")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AddressCreateSerializer
        return AddressSerializer

    def perform_create(self, serializer):
        if serializer.validated_data.get("is_default"):
            if not getattr(self.request.user, "is_anonymous", True):
                Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or getattr(self.request.user, "is_anonymous", True):
            return Address.objects.none()
        return Address.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get("is_default"):
            Address.objects.filter(user=self.request.user, is_default=True).exclude(pk=serializer.instance.pk).update(is_default=False)
        serializer.save()
