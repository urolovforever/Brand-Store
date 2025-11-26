from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer
from .models import User


class UserCreateSerializer(BaseUserCreateSerializer):
    """Serializer for user registration"""

    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone_number')


class UserSerializer(BaseUserSerializer):
    """Serializer for user profile"""

    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'date_of_birth',
            'avatar',
            'address',
            'city',
            'postal_code',
            'created_at'
        )
        read_only_fields = ('id', 'created_at')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""

    class Meta:
        model = User
        fields = (
            'first_name',
            'last_name',
            'phone_number',
            'date_of_birth',
            'avatar',
            'address',
            'city',
            'postal_code'
        )
