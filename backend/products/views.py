from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg

from .models import Category, Color, Size, Product, Review
from .serializers import (
    CategorySerializer,
    ColorSerializer,
    SizeSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ReviewSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for categories"""
    queryset = Category.objects.filter(is_active=True, parent=None)
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]


class ColorViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for colors"""
    queryset = Color.objects.all()
    serializer_class = ColorSerializer


class SizeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for sizes"""
    queryset = Size.objects.all()
    serializer_class = SizeSerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for products with comprehensive filtering and search
    """
    queryset = Product.objects.filter(is_active=True).select_related(
        'category'
    ).prefetch_related(
        'colors',
        'sizes',
        'images'
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['price', 'created_at', 'views_count']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by category
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        # Filter by colors
        colors = self.request.query_params.get('colors', None)
        if colors:
            color_ids = [int(c) for c in colors.split(',')]
            queryset = queryset.filter(colors__id__in=color_ids).distinct()

        # Filter by sizes
        sizes = self.request.query_params.get('sizes', None)
        if sizes:
            size_ids = [int(s) for s in sizes.split(',')]
            queryset = queryset.filter(sizes__id__in=size_ids).distinct()

        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Filter by tags
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag)

        # Filter for new arrivals
        is_new = self.request.query_params.get('is_new', None)
        if is_new and is_new.lower() == 'true':
            queryset = queryset.filter(is_new=True)

        # Filter for on sale
        on_sale = self.request.query_params.get('on_sale', None)
        if on_sale and on_sale.lower() == 'true':
            queryset = queryset.filter(discount_percentage__gt=0)

        # Filter for featured
        is_featured = self.request.query_params.get('is_featured', None)
        if is_featured and is_featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)

        # Filter for in stock
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        """Increment view count on product detail view"""
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get new arrival products"""
        products = self.get_queryset().filter(is_new=True)[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def on_sale(self, request):
        """Get products on sale"""
        products = self.get_queryset().filter(discount_percentage__gt=0)[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related products (same category)"""
        product = self.get_object()
        related_products = Product.objects.filter(
            category=product.category,
            is_active=True
        ).exclude(id=product.id)[:4]
        serializer = ProductListSerializer(related_products, many=True, context={'request': request})
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for product reviews"""
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product', None)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
