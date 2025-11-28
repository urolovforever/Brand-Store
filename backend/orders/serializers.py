from rest_framework import serializers
from .models import Order, OrderItem, PromoCode, Cart, CartItem
from products.serializers import ProductListSerializer


# ============================================
# CART SERIALIZERS
# ============================================

class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    color_id = serializers.IntegerField(required=False, allow_null=True)
    size_id = serializers.IntegerField(required=False, allow_null=True)
    unit_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    color_name = serializers.CharField(source='color.name', read_only=True)
    size_name = serializers.CharField(source='size.name', read_only=True)

    class Meta:
        model = CartItem
        fields = (
            'id',
            'product',
            'product_id',
            'quantity',
            'color',
            'color_id',
            'color_name',
            'size',
            'size_id',
            'size_name',
            'unit_price',
            'total_price',
            'added_at'
        )
        read_only_fields = ('id', 'added_at')


class CartSerializer(serializers.ModelSerializer):
    """Serializer for shopping cart"""
    items = CartItemSerializer(many=True, read_only=True)
    promo_code = serializers.SerializerMethodField()
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = Cart
        fields = ('id', 'items', 'promo_code', 'total_items', 'subtotal', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_promo_code(self, obj):
        """Get promo code details if applied"""
        if obj.promo_code:
            return {
                'code': obj.promo_code.code,
                'description': obj.promo_code.description,
                'discount_percentage': obj.promo_code.discount_percentage,
                'discount_fixed': float(obj.promo_code.discount_fixed),
                'min_order_amount': float(obj.promo_code.min_order_amount),
            }
        return None


# ============================================
# ORDER SERIALIZERS
# ============================================

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'product_name',
            'product_price',
            'color',
            'size',
            'quantity',
            'discount_percentage',
            'subtotal'
        )
        read_only_fields = ('id', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    order_number = serializers.UUIDField(read_only=True)
    can_be_cancelled = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'order_number',
            'user',
            'email',
            'phone_number',
            'full_name',
            'address',
            'city',
            'postal_code',
            'status',
            'payment_status',
            'payment_method',
            'subtotal',
            'discount_amount',
            'total',
            'payment_transaction_id',
            'customer_notes',
            'items',
            'can_be_cancelled',
            'created_at',
            'updated_at',
            'paid_at',
            'shipped_at',
            'delivered_at'
        )
        read_only_fields = (
            'id',
            'order_number',
            'user',
            'created_at',
            'updated_at',
            'paid_at',
            'shipped_at',
            'delivered_at'
        )


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = (
            'email',
            'phone_number',
            'full_name',
            'address',
            'city',
            'postal_code',
            'payment_method',
            'customer_notes',
            'items'
        )

    def create(self, validated_data):
        """Create order with items"""
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)

        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order


class PromoCodeSerializer(serializers.ModelSerializer):
    """Serializer for promo codes"""
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = PromoCode
        fields = (
            'id',
            'code',
            'description',
            'discount_percentage',
            'discount_fixed',
            'max_uses',
            'times_used',
            'valid_from',
            'valid_until',
            'min_order_amount',
            'is_active',
            'is_valid'
        )
        read_only_fields = ('id', 'times_used')


class PromoCodeValidateSerializer(serializers.Serializer):
    """Serializer for validating promo codes"""
    code = serializers.CharField(max_length=50)
    order_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
