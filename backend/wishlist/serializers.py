from rest_framework import serializers
from .models import Wishlist
from products.serializers import ProductListSerializer


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for wishlist items"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ('id', 'product', 'product_id', 'added_at')
        read_only_fields = ('id', 'added_at')

    def create(self, validated_data):
        """Create wishlist item"""
        user = self.context['request'].user
        product_id = validated_data.pop('product_id')

        # Check if already in wishlist
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=user,
            product_id=product_id
        )

        return wishlist_item
