import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services';
import './OrderHistory.css';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      // Backend returns orders with items
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#FFB800',
      PROCESSING: '#1F4EAD',
      SHIPPED: '#00A3FF',
      DELIVERED: '#34C759',
      CANCELLED: '#FF3B30',
      COMPLETED: '#34C759',
    };
    return colors[status] || '#6B6B6B';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Pending',
      PROCESSING: 'Processing',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      COMPLETED: 'Completed',
    };
    return labels[status] || status;
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="order-history-container">
        <div className="order-history-header">
          <h1 className="order-history-title">Order History</h1>
          <Link to="/profile" className="profile-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            My Account
          </Link>
        </div>

        {orders.length > 0 && (
          <div className="order-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders ({orders.length})
            </button>
            <button
              className={`filter-btn ${filter === 'PROCESSING' ? 'active' : ''}`}
              onClick={() => setFilter('PROCESSING')}
            >
              Processing
            </button>
            <button
              className={`filter-btn ${filter === 'SHIPPED' ? 'active' : ''}`}
              onClick={() => setFilter('SHIPPED')}
            >
              Shipped
            </button>
            <button
              className={`filter-btn ${filter === 'DELIVERED' ? 'active' : ''}`}
              onClick={() => setFilter('DELIVERED')}
            >
              Delivered
            </button>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <h2>No orders found</h2>
            <p>Start shopping to see your orders here</p>
            <Link to="/shop" className="shop-button">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Order Card Component
function OrderCard({ order, index, getStatusColor, getStatusLabel }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="order-card" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="order-header" onClick={() => setExpanded(!expanded)}>
        <div className="order-info">
          <div className="order-id-date">
            <h3 className="order-id">#{order.order_number}</h3>
            <span className="order-date">{formatDate(order.created_at)}</span>
          </div>
          <div className="order-meta">
            <span
              className="order-status"
              style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}
            >
              {getStatusLabel(order.status)}
            </span>
            {order.payment_transaction_id && (
              <span className="order-tracking">
                Transaction: {order.payment_transaction_id}
              </span>
            )}
          </div>
        </div>
        <div className="order-summary">
          <div className="order-total">
            <span className="total-label">Total</span>
            <span className="total-amount">{Number(order.total).toLocaleString()} UZS</span>
          </div>
          <button className="expand-button">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="order-details">
          <div className="order-items">
            <h4 className="items-title">Order Items</h4>
            {order.items.map((item, i) => (
              <div key={i} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.product_name}</span>
                  {item.color && <span className="item-variation">Color: {item.color}</span>}
                  {item.size && <span className="item-variation">Size: {item.size}</span>}
                  <span className="item-qty">× {item.quantity}</span>
                </div>
                <span className="item-price">{Number(item.subtotal).toLocaleString()} UZS</span>
              </div>
            ))}
          </div>

          <div className="order-actions">
            {order.status === 'SHIPPED' && (
              <button className="action-button primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Track Order
              </button>
            )}
            {order.status === 'DELIVERED' && (
              <button className="action-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Reorder
              </button>
            )}
            <button className="action-button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              View Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
