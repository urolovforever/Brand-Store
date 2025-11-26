from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, PromoCode, Cart, CartItem


class OrderItemInline(admin.TabularInline):
    """Inline for order items"""
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'product_price', 'subtotal')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin for Order model"""

    list_display = (
        'order_number',
        'full_name',
        'email',
        'total',
        'status',
        'payment_status',
        'payment_method',
        'created_at'
    )

    list_filter = (
        'status',
        'payment_status',
        'payment_method',
        'created_at'
    )

    search_fields = (
        'order_number',
        'email',
        'full_name',
        'phone_number'
    )

    readonly_fields = (
        'order_number',
        'user',
        'created_at',
        'updated_at',
        'paid_at',
        'shipped_at',
        'delivered_at'
    )

    inlines = [OrderItemInline]

    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'payment_status', 'payment_method')
        }),
        ('Customer Details', {
            'fields': ('full_name', 'email', 'phone_number')
        }),
        ('Shipping Address', {
            'fields': ('address', 'city', 'postal_code')
        }),
        ('Pricing', {
            'fields': ('subtotal', 'discount_amount', 'total')
        }),
        ('Payment', {
            'fields': ('payment_transaction_id',)
        }),
        ('Notes', {
            'fields': ('customer_notes', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at', 'shipped_at', 'delivered_at')
        }),
    )

    ordering = ('-created_at',)

    actions = [
        'mark_as_processing',
        'mark_as_shipped',
        'mark_as_delivered',
        'mark_as_completed'
    ]

    def mark_as_processing(self, request, queryset):
        queryset.update(status='PROCESSING')
    mark_as_processing.short_description = "Mark as Processing"

    def mark_as_shipped(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='SHIPPED', shipped_at=timezone.now())
    mark_as_shipped.short_description = "Mark as Shipped"

    def mark_as_delivered(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='DELIVERED', delivered_at=timezone.now())
    mark_as_delivered.short_description = "Mark as Delivered"

    def mark_as_completed(self, request, queryset):
        queryset.update(status='COMPLETED')
    mark_as_completed.short_description = "Mark as Completed"


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    """Admin for PromoCode model"""

    list_display = (
        'code',
        'discount_type',
        'is_active',
        'times_used',
        'max_uses',
        'valid_from',
        'valid_until'
    )

    list_filter = ('is_active', 'valid_from', 'valid_until')

    search_fields = ('code', 'description')

    readonly_fields = ('times_used', 'created_at')

    fieldsets = (
        ('Basic Info', {
            'fields': ('code', 'description', 'is_active')
        }),
        ('Discount Settings', {
            'fields': ('discount_percentage', 'discount_fixed', 'min_order_amount')
        }),
        ('Usage Limits', {
            'fields': ('max_uses', 'times_used')
        }),
        ('Validity Period', {
            'fields': ('valid_from', 'valid_until')
        }),
    )

    def discount_type(self, obj):
        """Display discount type"""
        if obj.discount_percentage > 0:
            return f"{obj.discount_percentage}%"
        elif obj.discount_fixed > 0:
            return f"${obj.discount_fixed}"
        return "None"
    discount_type.short_description = 'Discount'


class CartItemInline(admin.TabularInline):
    """Inline for cart items"""
    model = CartItem
    extra = 0
    readonly_fields = ('unit_price', 'total_price')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin for Cart model"""

    list_display = ('user', 'total_items', 'subtotal', 'updated_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'total_items', 'subtotal')
    inlines = [CartItemInline]
