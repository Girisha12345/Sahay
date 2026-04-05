from django.contrib import admin
from django.urls import include, path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework.permissions import AllowAny

from config.spa import serve_spa

schema_view = get_schema_view(
    openapi.Info(
        title="Sahay API",
        default_version='v1',
        description="Local services marketplace backend APIs",
    ),
    public=True,
    permission_classes=(AllowAny,),
)

urlpatterns = [
    path('', serve_spa, name='root-spa'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('accounts.provider_urls')),
    path('api/', include('services.urls')),
    path('api/', include('chat.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/addresses/', include('addresses.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/admin/', include('adminpanel.urls')),
    path('api/support/', include('support.urls')),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    re_path(r'^(?!api/|admin/|static/|media/).*$', serve_spa, name='spa-fallback'),
]
