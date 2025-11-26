from django.db import models


class Payment(models.Model):
    """Payment transaction records"""

    PAYMENT_METHOD_CHOICES = [
        ('CLICK', 'Click'),
        ('PAYME', 'PayMe'),
        ('COD', 'Cash on Delivery'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]

    # Related order
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='payments'
    )

    # Payment details
    payment_method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHOD_CHOICES
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='UZS')

    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    # Gateway transaction details
    transaction_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text="Transaction ID from payment gateway"
    )
    gateway_response = models.JSONField(
        null=True,
        blank=True,
        help_text="Full response from payment gateway"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['order', '-created_at']),
        ]

    def __str__(self):
        return f"Payment {self.transaction_id or self.id} - {self.payment_method} - {self.status}"
