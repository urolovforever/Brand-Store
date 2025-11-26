from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payment records"""

    class Meta:
        model = Payment
        fields = (
            'id',
            'order',
            'payment_method',
            'amount',
            'currency',
            'status',
            'transaction_id',
            'created_at',
            'updated_at',
            'completed_at'
        )
        read_only_fields = (
            'id',
            'transaction_id',
            'created_at',
            'updated_at',
            'completed_at'
        )


class PaymentInitiateSerializer(serializers.Serializer):
    """Serializer for initiating payment"""
    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['CLICK', 'PAYME', 'COD'])
    return_url = serializers.URLField(required=False)
