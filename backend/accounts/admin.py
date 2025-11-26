from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom user admin with additional fields"""

    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'phone_number',
        'is_staff',
        'is_active',
        'created_at'
    )

    list_filter = ('is_staff', 'is_active', 'is_superuser', 'created_at')

    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number')

    ordering = ('-created_at',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_number', 'date_of_birth', 'avatar')
        }),
        ('Address', {
            'fields': ('address', 'city', 'postal_code')
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'phone_number', 'first_name', 'last_name')
        }),
    )
