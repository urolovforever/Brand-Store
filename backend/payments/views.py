from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

from orders.models import Order
from .services import ClickPaymentService, PayMePaymentService
from .serializers import PaymentInitiateSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """
    Initiate payment for an order

    Body:
    {
        "order_id": 123,
        "payment_method": "CLICK" or "PAYME",
        "return_url": "https://yoursite.com/payment/success" (optional)
    }
    """
    serializer = PaymentInitiateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    order_id = serializer.validated_data['order_id']
    payment_method = serializer.validated_data['payment_method']
    return_url = serializer.validated_data.get('return_url')

    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if order.payment_status == 'COMPLETED':
        return Response(
            {'error': 'Order already paid'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        if payment_method == 'CLICK':
            service = ClickPaymentService()
            payment_data = service.create_payment(order, return_url)
        elif payment_method == 'PAYME':
            service = PayMePaymentService()
            payment_data = service.create_payment(order, return_url)
        elif payment_method == 'COD':
            # Cash on Delivery - no payment gateway needed
            return Response({
                'payment_method': 'COD',
                'order_id': order.id,
                'message': 'Order will be paid on delivery'
            })
        else:
            return Response(
                {'error': 'Invalid payment method'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(payment_data)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def click_prepare(request):
    """
    Click prepare callback endpoint
    """
    service = ClickPaymentService()
    result = service.handle_prepare(request.data)
    return Response(result)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def click_complete(request):
    """
    Click complete callback endpoint
    """
    service = ClickPaymentService()
    result = service.handle_complete(request.data)
    return Response(result)


@csrf_exempt
def payme_callback(request):
    """
    PayMe JSON-RPC callback endpoint
    """
    try:
        data = json.loads(request.body)
        method = data.get('method')
        params = data.get('params', {})

        service = PayMePaymentService()
        result = service.handle_jsonrpc(method, params, request.headers)

        response = {
            'jsonrpc': '2.0',
            'id': data.get('id')
        }

        if 'error' in result:
            response['error'] = result['error']
        else:
            response['result'] = result.get('result', {})

        return JsonResponse(response)

    except Exception as e:
        return JsonResponse({
            'jsonrpc': '2.0',
            'error': {
                'code': -32700,
                'message': str(e)
            },
            'id': None
        })
