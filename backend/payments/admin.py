from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin for Payment model"""

    list_display = (
        'transaction_id',
        'order',
        'payment_method',
        'amount',
        'currency',
        'status',
        'created_at'
    )

    list_filter = ('payment_method', 'status', 'created_at')

    search_fields = ('transaction_id', 'order__order_number')

    readonly_fields = ('created_at', 'updated_at', 'completed_at', 'gateway_response')

    fieldsets = (
        ('Order Info', {
            'fields': ('order',)
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'amount', 'currency', 'status')
        }),
        ('Gateway Details', {
            'fields': ('transaction_id', 'gateway_response')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at')
        }),
    )

    ordering = ('-created_at',)
