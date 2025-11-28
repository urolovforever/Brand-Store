from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    """Product categories with nested support"""
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Color(models.Model):
    """Available product colors"""
    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(max_length=7, help_text="Hex color code (e.g., #FF5733)")

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Size(models.Model):
    """Available product sizes"""
    name = models.CharField(max_length=10, unique=True, help_text="e.g., S, M, L, XL, XXL")
    order = models.IntegerField(default=0, help_text="Display order")

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Product(models.Model):
    """Main product model"""
    # Basic information
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)

    # Categorization
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products'
    )
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")

    # Pricing
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    discount_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Discount percentage (0-100)"
    )

    # Inventory
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    low_stock_threshold = models.IntegerField(default=10)

    # Variations
    colors = models.ManyToManyField(Color, blank=True, related_name='products')
    sizes = models.ManyToManyField(Size, blank=True, related_name='products')

    # Status flags
    is_active = models.BooleanField(default=True)
    is_new = models.BooleanField(default=False, help_text="Mark as New Arrival")
    is_featured = models.BooleanField(default=False, help_text="Featured on homepage")

    # Metadata
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_active', '-created_at']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def discounted_price(self):
        """Calculate price after discount"""
        if self.discount_percentage > 0:
            discount = (self.price * self.discount_percentage) / 100
            return self.price - discount
        return self.price

    @property
    def is_on_sale(self):
        """Check if product has a discount"""
        return self.discount_percentage > 0

    @property
    def is_in_stock(self):
        """Check if product is in stock"""
        return self.stock > 0

    @property
    def is_low_stock(self):
        """Check if stock is below threshold"""
        return 0 < self.stock <= self.low_stock_threshold


class ProductImage(models.Model):
    """Product images with multiple images per product"""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-is_primary']

    def __str__(self):
        return f"{self.product.name} - Image {self.id}"


class Review(models.Model):
    """Product reviews and ratings"""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5"
    )
    comment = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False, help_text="Admin moderation")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['product', 'user']  # One review per user per product

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating}/5)"
