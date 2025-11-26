from django.db import models
from django.core.validators import MinValueValidator
import uuid


class Cart(models.Model):
    """Shopping cart for authenticated users"""
    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'

    def __str__(self):
        return f"Cart for {self.user.username}"

    @property
    def total_items(self):
        """Count total items in cart"""
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        """Calculate cart subtotal"""
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    """Individual items in shopping cart"""
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    quantity = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )

    # Product variations
    color = models.ForeignKey(
        'products.Color',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    size = models.ForeignKey(
        'products.Size',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def unit_price(self):
        """Get the current price (with discount if applicable)"""
        return self.product.discounted_price

    @property
    def total_price(self):
        """Calculate total price for this cart item"""
        return self.unit_price * self.quantity


class Order(models.Model):
    """Order model with comprehensive tracking"""

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('CLICK', 'Click'),
        ('PAYME', 'PayMe'),
        ('COD', 'Cash on Delivery'),
    ]

    # Order identification
    order_number = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique order identifier"
    )

    # User information
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='orders',
        null=True,
        blank=True,
        help_text="Null for guest checkout"
    )

    # Contact information
    email = models.EmailField()
    phone_number = models.CharField(max_length=17)
    full_name = models.CharField(max_length=255)

    # Shipping address
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True)

    # Order details
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )
    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHOD_CHOICES
    )

    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)

    # Payment gateway references
    payment_transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Transaction ID from payment gateway"
    )

    # Notes
    customer_notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"Order {self.order_number} - {self.full_name}"

    @property
    def can_be_cancelled(self):
        """Check if order can be cancelled"""
        return self.status in ['PENDING', 'PROCESSING']


class OrderItem(models.Model):
    """Individual items in an order"""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items'
    )

    # Product snapshot (in case product is deleted/modified)
    product_name = models.CharField(max_length=255)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)

    # Variations
    color = models.CharField(max_length=50, blank=True)
    size = models.CharField(max_length=10, blank=True)

    # Quantity and pricing
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    discount_percentage = models.IntegerField(default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.product_name} (Order: {self.order.order_number})"

    def save(self, *args, **kwargs):
        """Calculate subtotal before saving"""
        price_after_discount = self.product_price
        if self.discount_percentage > 0:
            discount = (self.product_price * self.discount_percentage) / 100
            price_after_discount = self.product_price - discount
        self.subtotal = price_after_discount * self.quantity
        super().save(*args, **kwargs)


class PromoCode(models.Model):
    """Promo codes for discounts"""
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)

    # Discount settings
    discount_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Percentage discount (0 if using fixed amount)"
    )
    discount_fixed = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Fixed amount discount"
    )

    # Usage limits
    max_uses = models.IntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of uses (null for unlimited)"
    )
    times_used = models.IntegerField(default=0)

    # Validity period
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()

    # Minimum order requirement
    min_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        """Check if promo code is currently valid"""
        from django.utils import timezone
        now = timezone.now()

        if not self.is_active:
            return False
        if now < self.valid_from or now > self.valid_until:
            return False
        if self.max_uses and self.times_used >= self.max_uses:
            return False
        return True
