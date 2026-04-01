from rest_framework.permissions import BasePermission

from accounts.models import User


class IsCustomerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in [User.Role.CUSTOMER, User.Role.ADMIN]
        )
