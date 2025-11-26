from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Color, Size, Product, ProductImage, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin for Category model"""

    list_display = ('name', 'parent', 'is_active', 'order', 'created_at')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    """Admin for Color model"""

    list_display = ('name', 'hex_code', 'color_preview')
    search_fields = ('name', 'hex_code')

    def color_preview(self, obj):
        """Display color preview"""
        return format_html(
            '<div style="width: 50px; height: 25px; background-color: {};"></div>',
            obj.hex_code
        )
    color_preview.short_description = 'Preview'


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    """Admin for Size model"""

    list_display = ('name', 'order')
    ordering = ('order', 'name')


class ProductImageInline(admin.TabularInline):
    """Inline for product images"""
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin for Product model with comprehensive features"""

    list_display = (
        'name',
        'category',
        'price',
        'discount_percentage',
        'discounted_price',
        'stock',
        'stock_status',
        'is_new',
        'is_featured',
        'is_active',
        'views_count'
    )

    list_filter = (
        'is_active',
        'is_new',
        'is_featured',
        'category',
        'created_at'
    )

    search_fields = ('name', 'description', 'tags')

    prepopulated_fields = {'slug': ('name',)}

    filter_horizontal = ('colors', 'sizes')

    inlines = [ProductImageInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'short_description', 'category', 'tags')
        }),
        ('Pricing', {
            'fields': ('price', 'discount_percentage')
        }),
        ('Inventory', {
            'fields': ('stock', 'low_stock_threshold')
        }),
        ('Variations', {
            'fields': ('colors', 'sizes')
        }),
        ('Status', {
            'fields': ('is_active', 'is_new', 'is_featured')
        }),
    )

    ordering = ('-created_at',)

    def stock_status(self, obj):
        """Display stock status with color"""
        if obj.stock == 0:
            color = 'red'
            status = 'Out of Stock'
        elif obj.is_low_stock:
            color = 'orange'
            status = 'Low Stock'
        else:
            color = 'green'
            status = 'In Stock'

        return format_html(
            '<span style="color: {};">{}</span>',
            color,
            status
        )
    stock_status.short_description = 'Stock Status'

    actions = ['mark_as_new', 'mark_as_featured', 'mark_as_active', 'mark_as_inactive']

    def mark_as_new(self, request, queryset):
        queryset.update(is_new=True)
    mark_as_new.short_description = "Mark selected products as NEW"

    def mark_as_featured(self, request, queryset):
        queryset.update(is_featured=True)
    mark_as_featured.short_description = "Mark selected products as FEATURED"

    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)
    mark_as_active.short_description = "Mark selected products as ACTIVE"

    def mark_as_inactive(self, request, queryset):
        queryset.update(is_active=False)
    mark_as_inactive.short_description = "Mark selected products as INACTIVE"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin for ProductImage model"""

    list_display = ('product', 'image', 'is_primary', 'order')
    list_filter = ('is_primary', 'product')
    search_fields = ('product__name', 'alt_text')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin for Review model with moderation"""

    list_display = ('product', 'user', 'rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating', 'created_at')
    search_fields = ('product__name', 'user__username', 'comment')
    ordering = ('-created_at',)

    actions = ['approve_reviews', 'reject_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"

    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    reject_reviews.short_description = "Reject selected reviews"
