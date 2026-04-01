from rest_framework.permissions import BasePermission

from accounts.models import User


class IsCustomerCreateOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method != "POST":
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.CUSTOMER)
