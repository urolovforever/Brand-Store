from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Wishlist
from .serializers import WishlistSerializer
from products.models import Product


class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for wishlist management"""
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get wishlist items for current user"""
        return Wishlist.objects.filter(user=self.request.user).select_related(
            'product'
        ).prefetch_related(
            'product__images',
            'product__category'
        )

    def create(self, request):
        """Add item to wishlist"""
        product_id = request.data.get('product_id')

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already in wishlist
        if Wishlist.objects.filter(user=request.user, product=product).exists():
            return Response(
                {'error': 'Product already in wishlist'},
                status=status.HTTP_400_BAD_REQUEST
            )

        wishlist_item = Wishlist.objects.create(
            user=request.user,
            product=product
        )

        serializer = WishlistSerializer(wishlist_item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        """Remove item from wishlist"""
        try:
            wishlist_item = Wishlist.objects.get(
                id=pk,
                user=request.user
            )
            wishlist_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Wishlist.DoesNotExist:
            return Response(
                {'error': 'Wishlist item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Clear all items from wishlist"""
        Wishlist.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Toggle product in wishlist (add if not present, remove if present)"""
        product_id = request.data.get('product_id')

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist_item = Wishlist.objects.filter(
            user=request.user,
            product=product
        ).first()

        if wishlist_item:
            # Remove from wishlist
            wishlist_item.delete()
            return Response({
                'in_wishlist': False,
                'message': 'Removed from wishlist'
            })
        else:
            # Add to wishlist
            wishlist_item = Wishlist.objects.create(
                user=request.user,
                product=product
            )
            serializer = WishlistSerializer(wishlist_item, context={'request': request})
            return Response({
                'in_wishlist': True,
                'message': 'Added to wishlist',
                'item': serializer.data
            }, status=status.HTTP_201_CREATED)
