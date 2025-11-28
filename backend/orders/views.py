from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Order, OrderItem, PromoCode, Cart, CartItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    PromoCodeSerializer,
    PromoCodeValidateSerializer,
    CartSerializer,
    CartItemSerializer
)
from products.models import Product


class CartViewSet(viewsets.ViewSet):
    """ViewSet for shopping cart management"""
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get user's cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)

        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        color_id = request.data.get('color_id')
        size_id = request.data.get('size_id')

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if item already exists in cart
        # Handle None values for color_id and size_id properly
        if color_id is None and size_id is None:
            cart_item = CartItem.objects.filter(
                cart=cart,
                product=product,
                color__isnull=True,
                size__isnull=True
            ).first()
        elif color_id is None:
            cart_item = CartItem.objects.filter(
                cart=cart,
                product=product,
                color__isnull=True,
                size_id=size_id
            ).first()
        elif size_id is None:
            cart_item = CartItem.objects.filter(
                cart=cart,
                product=product,
                color_id=color_id,
                size__isnull=True
            ).first()
        else:
            cart_item = CartItem.objects.filter(
                cart=cart,
                product=product,
                color_id=color_id,
                size_id=size_id
            ).first()

        if cart_item:
            # Update quantity
            cart_item.quantity += quantity
            cart_item.save()
        else:
            # Create new cart item
            cart_item = CartItem.objects.create(
                cart=cart,
                product=product,
                quantity=quantity,
                color_id=color_id,
                size_id=size_id
            )

        serializer = CartItemSerializer(cart_item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """Update cart item quantity"""
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')

        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if quantity <= 0:
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartItemSerializer(cart_item, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Remove item from cart"""
        item_id = request.data.get('item_id')

        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from cart"""
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            cart.items.all().delete()
            cart.promo_code = None
            cart.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def apply_promo(self, request):
        """Apply promo code to cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        code = request.data.get('code', '').strip().upper()

        if not code:
            return Response(
                {'error': 'Promo code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            promo = PromoCode.objects.get(code=code, is_active=True)
        except PromoCode.DoesNotExist:
            return Response(
                {'error': 'Invalid promo code'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if promo is valid
        if not promo.is_valid:
            return Response(
                {'error': 'Promo code has expired or reached maximum uses'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check minimum order amount
        subtotal = sum(item.product.price * item.quantity for item in cart.items.all())
        if subtotal < promo.min_order_amount:
            return Response(
                {'error': f'Minimum order amount is {promo.min_order_amount} UZS'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Apply promo code
        cart.promo_code = promo
        cart.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_promo(self, request):
        """Remove promo code from cart"""
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            cart.promo_code = None
            cart.save()

        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for order management"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get orders for current user or all if admin"""
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request):
        """Create order from cart"""
        cart = Cart.objects.filter(user=request.user).first()

        if not cart or not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate stock for all items
        for item in cart.items.all():
            if item.product.stock < item.quantity:
                return Response(
                    {'error': f'Insufficient stock for {item.product.name}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create order
        order_data = {
            'user': request.user,
            'email': request.data.get('email', request.user.email),
            'phone_number': request.data.get('phone_number', request.user.phone_number),
            'full_name': request.data.get('full_name', request.user.full_name),
            'address': request.data.get('address', request.user.address),
            'city': request.data.get('city', request.user.city),
            'postal_code': request.data.get('postal_code', request.user.postal_code),
            'payment_method': request.data.get('payment_method'),
            'customer_notes': request.data.get('customer_notes', ''),
            'subtotal': cart.subtotal,
            'total': cart.subtotal,
        }

        # Apply promo code if provided
        promo_code = request.data.get('promo_code')
        if promo_code:
            try:
                promo = PromoCode.objects.get(code=promo_code, is_active=True)
                if promo.is_valid and cart.subtotal >= promo.min_order_amount:
                    if promo.discount_percentage > 0:
                        discount = (cart.subtotal * promo.discount_percentage) / 100
                    else:
                        discount = promo.discount_fixed

                    order_data['discount_amount'] = discount
                    order_data['total'] = cart.subtotal - discount
                    promo.times_used += 1
                    promo.save()
            except PromoCode.DoesNotExist:
                pass

        order = Order.objects.create(**order_data)

        # Create order items from cart
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=cart_item.product.price,
                color=cart_item.color.name if cart_item.color else '',
                size=cart_item.size.name if cart_item.size else '',
                quantity=cart_item.quantity,
                discount_percentage=cart_item.product.discount_percentage
            )

            # Reduce stock
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()

        # Clear cart
        cart.items.all().delete()

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()

        if not order.can_be_cancelled:
            return Response(
                {'error': 'Order cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restore stock
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()

        order.status = 'CANCELLED'
        order.payment_status = 'CANCELLED'
        order.save()

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)


class PromoCodeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for promo codes"""
    queryset = PromoCode.objects.filter(is_active=True)
    serializer_class = PromoCodeSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def validate(self, request):
        """Validate a promo code"""
        serializer = PromoCodeValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code']
        order_amount = serializer.validated_data['order_amount']

        try:
            promo = PromoCode.objects.get(code=code, is_active=True)
        except PromoCode.DoesNotExist:
            return Response(
                {'error': 'Invalid promo code'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not promo.is_valid:
            return Response(
                {'error': 'Promo code is expired or reached maximum uses'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order_amount < promo.min_order_amount:
            return Response(
                {'error': f'Minimum order amount is {promo.min_order_amount}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate discount
        if promo.discount_percentage > 0:
            discount = (order_amount * promo.discount_percentage) / 100
        else:
            discount = promo.discount_fixed

        return Response({
            'valid': True,
            'discount_amount': discount,
            'final_amount': order_amount - discount,
            'promo_code': PromoCodeSerializer(promo).data
        })
