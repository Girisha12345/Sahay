from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework.permissions import AllowAny

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
    path('', RedirectView.as_view(url='/api/docs/', permanent=False), name='root-redirect'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('accounts.provider_urls')),
    path('api/', include('services.urls')),
    path('api/', include('chat.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reviews/', include('reviews.urls')),
    path('api/admin/', include('adminpanel.urls')),
    path('api/support/', include('support.urls')),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
]
