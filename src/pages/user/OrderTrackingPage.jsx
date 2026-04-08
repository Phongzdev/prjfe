import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReviewModal from '../../components/user/ReviewModal';

const OrderTrackingPage = () => {
    const { orderId } = useParams();
    const { user } = useSelector((state) => state.auth);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    const statusSteps = [
        { key: 'pending', label: 'Order Placed', icon: '📝', description: 'Your order has been received' },
        { key: 'confirmed', label: 'Confirmed', icon: '✅', description: 'Restaurant has confirmed your order' },
        { key: 'preparing', label: 'Preparing', icon: '🍳', description: 'Your food is being prepared' },
        { key: 'ready', label: 'Ready', icon: '📦', description: 'Your order is ready for delivery' },
        { key: 'delivering', label: 'Delivering', icon: '🚚', description: 'Your order is on the way' },
        { key: 'delivered', label: 'Delivered', icon: '🏠', description: 'Your order has been delivered' },
    ];

    useEffect(() => {
        fetchOrder();
        setupSocket();
    }, [orderId]);

    useEffect(() => {
        if (order?.status === 'delivered') {
            checkIfReviewed();
        }
    }, [order]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${orderId}/track`);
            setOrder(response.data.order);
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const checkIfReviewed = async () => {
        try {
            const response = await api.get('/reviews/my-reviews');
            const reviewed = response.data.reviews.some(r => r.order_id === parseInt(orderId));
            setHasReviewed(reviewed);
        } catch (error) {
            console.error('Check review error:', error);
        }
    };

    const setupSocket = () => {
        const socket = getSocket();
        if (!socket) return;

        socket.emit('join-order', orderId);

        socket.on('order-status-update', (data) => {
            console.log('Order update:', data);
            setOrder(prev => ({
                ...prev,
                status: data.newStatus,
                estimated_delivery_time: data.estimatedDeliveryTime,
                delivered_at: data.deliveredAt,
            }));

            setNotifications(prev => [{
                id: Date.now(),
                message: data.message,
                timestamp: new Date(data.timestamp),
                status: data.newStatus
            }, ...prev]);

            toast.success(data.message);
        });

        return () => {
            socket.emit('leave-order', orderId);
            socket.off('order-status-update');
        };
    };

    const getCurrentStepIndex = () => {
        if (!order) return 0;
        const index = statusSteps.findIndex(step => step.key === order.status);
        return index !== -1 ? index : 0;
    };

    const getStatusColor = (stepKey, currentIndex, stepIndex) => {
        if (stepIndex < currentIndex) return 'bg-green-600';
        if (stepIndex === currentIndex) return 'bg-primary animate-pulse';
        return 'bg-gray-300';
    };

    const handleReviewSuccess = () => {
        setHasReviewed(true);
        toast.success('Thank you for your review!');
    };

    if (loading) return <LoadingSpinner />;

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 text-center">
                <p className="text-gray-500">Order not found</p>
                <Link to="/" className="text-primary mt-4 inline-block">Go Home</Link>
            </div>
        );
    }

    const currentStep = getCurrentStepIndex();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Order Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                            <p className="text-gray-600 mt-1">
                                Placed on {new Date(order.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-2xl font-bold text-primary">
                                {parseFloat(order.total_amount).toLocaleString()}đ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-6">Order Status</h2>
                    <div className="relative">
                        {/* Progress Bar Background */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded"></div>
                        {/* Progress Bar Fill */}
                        <div
                            className="absolute top-5 left-0 h-1 bg-primary rounded transition-all duration-500"
                            style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                        ></div>

                        {/* Steps */}
                        <div className="relative flex justify-between">
                            {statusSteps.map((step, index) => (
                                <div key={step.key} className="flex flex-col items-center text-center">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10
                                        ${getStatusColor(step.key, currentStep, index)}
                                        text-white transition-all duration-300
                                    `}>
                                        {step.icon}
                                    </div>
                                    <span className={`text-xs font-medium ${index <= currentStep ? 'text-primary' : 'text-gray-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current Status Description */}
                    <div className="mt-8 p-4 bg-orange-50 rounded-lg">
                        <p className="text-primary font-medium">
                            {statusSteps[currentStep]?.description}
                        </p>
                        {order.estimated_delivery_time && (
                            <p className="text-sm text-gray-600 mt-2">
                                Estimated delivery: {new Date(order.estimated_delivery_time).toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Order Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Restaurant Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold mb-3">Restaurant Information</h3>
                        <p className="font-medium">{order.restaurant?.name}</p>
                        <p className="text-sm text-gray-600">{order.restaurant?.address}</p>
                        <p className="text-sm text-gray-600">Phone: {order.restaurant?.phone}</p>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="font-semibold mb-3">Delivery Information</h3>
                        <p className="text-sm text-gray-600">Delivery Address:</p>
                        <p className="font-medium">{order.delivery_address}</p>
                        <p className="text-sm text-gray-600 mt-2">Payment Method:</p>
                        <p className="font-medium capitalize">
                            {order.payment_method === 'cash' ? 'Cash on Delivery' :
                                order.payment_method === 'momo' ? 'MoMo Wallet' : 'Credit Card'}
                        </p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b">
                                <div className="flex-1">
                                    <p className="font-medium">{item.menu_item?.name}</p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                    {item.special_instructions && (
                                        <p className="text-xs text-gray-400">Note: {item.special_instructions}</p>
                                    )}
                                </div>
                                <p className="font-medium">{parseFloat(item.subtotal).toLocaleString()}đ</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{(parseFloat(order.total_amount) - parseFloat(order.delivery_fee)).toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span>Delivery Fee</span>
                            <span>{parseFloat(order.delivery_fee).toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                            <span>Total</span>
                            <span className="text-primary">{parseFloat(order.total_amount).toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>

                {/* Real-time Notifications */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="font-semibold mb-4">Live Updates</h3>
                    {notifications.length === 0 ? (
                        <p className="text-gray-500 text-sm">Waiting for updates...</p>
                    ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="border-l-4 border-primary pl-4 py-2">
                                    <p className="text-xs text-gray-500">
                                        {new Date(notif.timestamp).toLocaleTimeString()}
                                    </p>
                                    <p className="text-sm font-medium">{notif.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
                    <Link
                        to="/restaurants"
                        className="text-primary hover:text-orange-600"
                    >
                        ← Back to Restaurants
                    </Link>

                    <div className="flex gap-4">
                        {/* Review Button - Chỉ hiển thị khi đã giao hàng và chưa review */}
                        {order.status === 'delivered' && !hasReviewed && (
                            <button
                                onClick={() => setShowReviewModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                                <span>⭐</span>
                                Write a Review
                            </button>
                        )}

                        {/* Cancel Button */}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to cancel this order?')) {
                                        try {
                                            await api.put(`/orders/${order.id}/cancel`);
                                            toast.success('Order cancelled');
                                            fetchOrder();
                                        } catch (error) {
                                            toast.error('Failed to cancel order');
                                        }
                                    }
                                }}
                                className="text-red-500 hover:text-red-700"
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>

                {/* Review Modal */}
                {showReviewModal && order && (
                    <ReviewModal
                        order={order}
                        isOpen={showReviewModal}
                        onClose={() => setShowReviewModal(false)}
                        onSuccess={handleReviewSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default OrderTrackingPage;