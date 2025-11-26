"""
Payment gateway services for Click and PayMe
"""
import requests
import hashlib
import json
from decimal import Decimal
from django.conf import settings
from django.utils import timezone

from .models import Payment
from orders.models import Order


class ClickPaymentService:
    """
    Click Payment Gateway Integration

    To use this service:
    1. Register as a merchant at https://click.uz
    2. Get your merchant credentials (merchant_id, service_id, secret_key)
    3. Add to settings or .env file:
       - CLICK_MERCHANT_ID
       - CLICK_SERVICE_ID
       - CLICK_SECRET_KEY
    """

    BASE_URL = "https://api.click.uz/v2/merchant"

    def __init__(self):
        self.merchant_id = getattr(settings, 'CLICK_MERCHANT_ID', None)
        self.service_id = getattr(settings, 'CLICK_SERVICE_ID', None)
        self.secret_key = getattr(settings, 'CLICK_SECRET_KEY', None)

    def create_payment(self, order, return_url=None):
        """
        Create a Click payment link

        Args:
            order: Order instance
            return_url: URL to redirect after payment

        Returns:
            dict with payment_url and transaction_id
        """
        if not all([self.merchant_id, self.service_id, self.secret_key]):
            raise ValueError("Click payment credentials not configured")

        # Create payment record
        payment = Payment.objects.create(
            order=order,
            payment_method='CLICK',
            amount=order.total,
            currency='UZS',
            status='PENDING'
        )

        # Generate payment URL
        amount = int(order.total * 100)  # Convert to tiyin (smallest unit)

        payment_url = (
            f"https://my.click.uz/services/pay?"
            f"service_id={self.service_id}&"
            f"merchant_id={self.merchant_id}&"
            f"amount={amount}&"
            f"transaction_param={order.order_number}&"
            f"return_url={return_url or ''}"
        )

        return {
            'payment_url': payment_url,
            'transaction_id': payment.id,
            'payment_id': payment.id
        }

    def verify_signature(self, data):
        """Verify Click callback signature"""
        sign_string = (
            f"{data.get('click_trans_id')}"
            f"{data.get('service_id')}"
            f"{self.secret_key}"
            f"{data.get('merchant_trans_id')}"
            f"{data.get('amount')}"
            f"{data.get('action')}"
            f"{data.get('sign_time')}"
        )

        sign = hashlib.md5(sign_string.encode()).hexdigest()
        return sign == data.get('sign_string')

    def handle_prepare(self, data):
        """Handle Click prepare request"""
        if not self.verify_signature(data):
            return {
                'error': -1,
                'error_note': 'Invalid signature'
            }

        try:
            order = Order.objects.get(order_number=data.get('merchant_trans_id'))

            if order.payment_status == 'COMPLETED':
                return {
                    'error': -4,
                    'error_note': 'Order already paid'
                }

            if order.total != Decimal(data.get('amount')) / 100:
                return {
                    'error': -2,
                    'error_note': 'Incorrect amount'
                }

            return {
                'click_trans_id': data.get('click_trans_id'),
                'merchant_trans_id': data.get('merchant_trans_id'),
                'merchant_prepare_id': order.id,
                'error': 0,
                'error_note': 'Success'
            }

        except Order.DoesNotExist:
            return {
                'error': -5,
                'error_note': 'Order not found'
            }

    def handle_complete(self, data):
        """Handle Click complete request"""
        if not self.verify_signature(data):
            return {
                'error': -1,
                'error_note': 'Invalid signature'
            }

        try:
            order = Order.objects.get(order_number=data.get('merchant_trans_id'))

            if data.get('error') == '0':
                # Payment successful
                order.payment_status = 'COMPLETED'
                order.paid_at = timezone.now()
                order.payment_transaction_id = data.get('click_trans_id')
                order.save()

                # Update payment record
                payment = Payment.objects.filter(order=order).first()
                if payment:
                    payment.status = 'COMPLETED'
                    payment.transaction_id = data.get('click_trans_id')
                    payment.gateway_response = data
                    payment.completed_at = timezone.now()
                    payment.save()
            else:
                # Payment failed
                order.payment_status = 'FAILED'
                order.save()

                payment = Payment.objects.filter(order=order).first()
                if payment:
                    payment.status = 'FAILED'
                    payment.gateway_response = data
                    payment.save()

            return {
                'click_trans_id': data.get('click_trans_id'),
                'merchant_trans_id': data.get('merchant_trans_id'),
                'merchant_confirm_id': order.id,
                'error': 0,
                'error_note': 'Success'
            }

        except Order.DoesNotExist:
            return {
                'error': -5,
                'error_note': 'Order not found'
            }


class PayMePaymentService:
    """
    PayMe Payment Gateway Integration

    To use this service:
    1. Register as a merchant at https://payme.uz
    2. Get your merchant credentials (merchant_id, secret_key)
    3. Add to settings or .env file:
       - PAYME_MERCHANT_ID
       - PAYME_SECRET_KEY
    """

    BASE_URL = "https://checkout.paycom.uz/api"

    def __init__(self):
        self.merchant_id = getattr(settings, 'PAYME_MERCHANT_ID', None)
        self.secret_key = getattr(settings, 'PAYME_SECRET_KEY', None)

    def create_payment(self, order, return_url=None):
        """
        Create a PayMe payment link

        Args:
            order: Order instance
            return_url: URL to redirect after payment

        Returns:
            dict with payment_url and transaction_id
        """
        if not all([self.merchant_id, self.secret_key]):
            raise ValueError("PayMe payment credentials not configured")

        # Create payment record
        payment = Payment.objects.create(
            order=order,
            payment_method='PAYME',
            amount=order.total,
            currency='UZS',
            status='PENDING'
        )

        # Convert amount to tiyin
        amount = int(order.total * 100)

        # Generate payment URL
        import base64
        params = f"m={self.merchant_id};ac.order_id={order.order_number};a={amount}"
        encoded_params = base64.b64encode(params.encode()).decode()

        payment_url = f"https://checkout.paycom.uz/{encoded_params}"

        return {
            'payment_url': payment_url,
            'transaction_id': payment.id,
            'payment_id': payment.id
        }

    def verify_request(self, headers):
        """Verify PayMe request authentication"""
        import base64

        auth_header = headers.get('Authorization', '')
        if not auth_header.startswith('Basic '):
            return False

        try:
            credentials = base64.b64decode(auth_header[6:]).decode()
            username, password = credentials.split(':')
            return username == 'Paycom' and password == self.secret_key
        except:
            return False

    def handle_jsonrpc(self, method, params, headers):
        """Handle PayMe JSON-RPC requests"""
        if not self.verify_request(headers):
            return {
                'error': {
                    'code': -32504,
                    'message': 'Insufficient privilege to perform this method'
                }
            }

        if method == 'CheckPerformTransaction':
            return self.check_perform_transaction(params)
        elif method == 'CreateTransaction':
            return self.create_transaction(params)
        elif method == 'PerformTransaction':
            return self.perform_transaction(params)
        elif method == 'CancelTransaction':
            return self.cancel_transaction(params)
        elif method == 'CheckTransaction':
            return self.check_transaction(params)

        return {
            'error': {
                'code': -32601,
                'message': 'Method not found'
            }
        }

    def check_perform_transaction(self, params):
        """Check if transaction can be performed"""
        try:
            order = Order.objects.get(order_number=params.get('account', {}).get('order_id'))

            if order.payment_status == 'COMPLETED':
                return {
                    'error': {
                        'code': -31008,
                        'message': 'Order already paid'
                    }
                }

            amount = params.get('amount')
            if order.total != Decimal(amount) / 100:
                return {
                    'error': {
                        'code': -31001,
                        'message': 'Incorrect amount'
                    }
                }

            return {'result': {'allow': True}}

        except Order.DoesNotExist:
            return {
                'error': {
                    'code': -31050,
                    'message': 'Order not found'
                }
            }

    def create_transaction(self, params):
        """Create transaction"""
        try:
            order = Order.objects.get(order_number=params.get('account', {}).get('order_id'))

            payment, created = Payment.objects.get_or_create(
                order=order,
                transaction_id=params.get('id'),
                defaults={
                    'payment_method': 'PAYME',
                    'amount': order.total,
                    'currency': 'UZS',
                    'status': 'PROCESSING',
                    'gateway_response': params
                }
            )

            return {
                'result': {
                    'create_time': int(payment.created_at.timestamp() * 1000),
                    'transaction': str(payment.id),
                    'state': 1
                }
            }

        except Order.DoesNotExist:
            return {
                'error': {
                    'code': -31050,
                    'message': 'Order not found'
                }
            }

    def perform_transaction(self, params):
        """Perform transaction"""
        try:
            payment = Payment.objects.get(transaction_id=params.get('id'))

            payment.status = 'COMPLETED'
            payment.completed_at = timezone.now()
            payment.save()

            order = payment.order
            order.payment_status = 'COMPLETED'
            order.paid_at = timezone.now()
            order.save()

            return {
                'result': {
                    'transaction': str(payment.id),
                    'perform_time': int(payment.completed_at.timestamp() * 1000),
                    'state': 2
                }
            }

        except Payment.DoesNotExist:
            return {
                'error': {
                    'code': -31003,
                    'message': 'Transaction not found'
                }
            }

    def cancel_transaction(self, params):
        """Cancel transaction"""
        try:
            payment = Payment.objects.get(transaction_id=params.get('id'))

            payment.status = 'CANCELLED'
            payment.save()

            order = payment.order
            order.payment_status = 'FAILED'
            order.save()

            # Restore stock
            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save()

            return {
                'result': {
                    'transaction': str(payment.id),
                    'cancel_time': int(timezone.now().timestamp() * 1000),
                    'state': -1
                }
            }

        except Payment.DoesNotExist:
            return {
                'error': {
                    'code': -31003,
                    'message': 'Transaction not found'
                }
            }

    def check_transaction(self, params):
        """Check transaction status"""
        try:
            payment = Payment.objects.get(transaction_id=params.get('id'))

            state = {
                'PENDING': 1,
                'PROCESSING': 1,
                'COMPLETED': 2,
                'CANCELLED': -1,
                'FAILED': -2
            }.get(payment.status, 0)

            return {
                'result': {
                    'create_time': int(payment.created_at.timestamp() * 1000),
                    'perform_time': int(payment.completed_at.timestamp() * 1000) if payment.completed_at else 0,
                    'transaction': str(payment.id),
                    'state': state
                }
            }

        except Payment.DoesNotExist:
            return {
                'error': {
                    'code': -31003,
                    'message': 'Transaction not found'
                }
            }
