"""
URL configuration for University Store E-commerce Platform
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Import ViewSets
from products.views import (
    CategoryViewSet,
    ColorViewSet,
    SizeViewSet,
    ProductViewSet,
    ReviewViewSet
)
from orders.views import CartViewSet, OrderViewSet, PromoCodeViewSet
from wishlist.views import WishlistViewSet
from payments.views import (
    initiate_payment,
    click_prepare,
    click_complete,
    payme_callback
)


# Create API router
router = DefaultRouter()

# Products routes
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'colors', ColorViewSet, basename='color')
router.register(r'sizes', SizeViewSet, basename='size')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'reviews', ReviewViewSet, basename='review')

# Cart and Orders routes
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'promo-codes', PromoCodeViewSet, basename='promocode')

# Wishlist routes
router.register(r'wishlist', WishlistViewSet, basename='wishlist')


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Authentication (Djoser)
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),

    # API routes
    path('api/', include(router.urls)),

    # Payment endpoints
    path('api/payments/initiate/', initiate_payment, name='initiate-payment'),
    path('api/payments/click/prepare/', click_prepare, name='click-prepare'),
    path('api/payments/click/complete/', click_complete, name='click-complete'),
    path('api/payments/payme/callback/', payme_callback, name='payme-callback'),
]

# Media files (only in development)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
