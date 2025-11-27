from rest_framework import serializers
from .models import Category, Color, Size, Product, ProductImage, Review


class ColorSerializer(serializers.ModelSerializer):
    """Serializer for Color model"""

    class Meta:
        model = Color
        fields = ('id', 'name', 'hex_code')


class SizeSerializer(serializers.ModelSerializer):
    """Serializer for Size model"""

    class Meta:
        model = Size
        fields = ('id', 'name', 'order')


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model with nested children"""
    children = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'image',
            'parent',
            'children',
            'is_active',
            'order'
        )

    def get_children(self, obj):
        """Get child categories"""
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True, context=self.context).data
        return []

    def get_image(self, obj):
        """Get absolute URL for category image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model"""
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'order')

    def get_image(self, obj):
        """Get absolute URL for image"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            'id',
            'product',
            'user',
            'user_name',
            'user_avatar',
            'rating',
            'comment',
            'is_approved',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'is_approved')

    def get_user_avatar(self, obj):
        """Get absolute URL for user avatar"""
        if obj.user and obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
            return obj.user.avatar.url
        return None


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category = CategorySerializer(read_only=True)
    colors = ColorSerializer(many=True, read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    discounted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'slug',
            'short_description',
            'category',
            'category_name',
            'price',
            'discount_percentage',
            'discounted_price',
            'is_on_sale',
            'is_new',
            'is_featured',
            'is_in_stock',
            'primary_image',
            'colors',
            'sizes',
            'images',
            'created_at'
        )

    def get_primary_image(self, obj):
        """Get primary product image"""
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        # Fallback to first image
        first_image = obj.images.first()
        if first_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first_image.image.url)
            return first_image.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single product view"""
    category = CategorySerializer(read_only=True)
    colors = ColorSerializer(many=True, read_only=True)
    sizes = SizeSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    discounted_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'short_description',
            'category',
            'tags',
            'price',
            'discount_percentage',
            'discounted_price',
            'stock',
            'is_in_stock',
            'is_low_stock',
            'is_on_sale',
            'is_new',
            'is_featured',
            'colors',
            'sizes',
            'images',
            'reviews',
            'average_rating',
            'total_reviews',
            'views_count',
            'created_at'
        )

    def get_reviews(self, obj):
        """Get approved reviews"""
        approved_reviews = obj.reviews.filter(is_approved=True)[:5]
        return ReviewSerializer(approved_reviews, many=True).data

    def get_average_rating(self, obj):
        """Calculate average rating"""
        approved_reviews = obj.reviews.filter(is_approved=True)
        if approved_reviews.exists():
            from django.db.models import Avg
            return approved_reviews.aggregate(Avg('rating'))['rating__avg']
        return None

    def get_total_reviews(self, obj):
        """Count total approved reviews"""
        return obj.reviews.filter(is_approved=True).count()


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""

    class Meta:
        model = Product
        fields = (
            'id',
            'name',
            'slug',
            'description',
            'short_description',
            'category',
            'tags',
            'price',
            'discount_percentage',
            'stock',
            'low_stock_threshold',
            'colors',
            'sizes',
            'is_active',
            'is_new',
            'is_featured'
        )
        read_only_fields = ('id',)
