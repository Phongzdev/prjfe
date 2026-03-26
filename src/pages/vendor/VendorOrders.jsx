import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const VendorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [restaurant, setRestaurant] = useState(null);

    useEffect(() => {
        fetchRestaurant();
        fetchOrders();
        setupSocket();
    }, []);

    const setupSocket = () => {
        const socket = getSocket();
        if (!socket) return;

        if (restaurant?.id) {
            socket.emit('join-restaurant', restaurant.id);
        }

        socket.on('new-order', () => {
            fetchOrders();
            toast.success('🆕 New order received!');
        });

        socket.on('order-updated', () => {
            fetchOrders();
        });

        return () => {
            socket.off('new-order');
            socket.off('order-updated');
        };
    };

    const fetchRestaurant = async () => {
        try {
            const response = await api.get('/restaurants/my-restaurant');
            setRestaurant(response.data.restaurant);
        } catch (error) {
            console.error('Error fetching restaurant:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/vendor/orders');
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
        }
    };

    const getFilteredOrders = () => {
        if (filter === 'all') return orders;
        return orders.filter(order => order.status === filter);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500',
            confirmed: 'bg-blue-500',
            preparing: 'bg-purple-500',
            ready: 'bg-indigo-500',
            delivering: 'bg-orange-500',
            delivered: 'bg-green-500',
            cancelled: 'bg-red-500',
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            preparing: 'Preparing',
            ready: 'Ready',
            delivering: 'Delivering',
            delivered: 'Delivered',
            cancelled: 'Cancelled',
        };
        return texts[status] || status;
    };

    const statusOptions = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'ready', label: 'Ready' },
        { value: 'delivering', label: 'Delivering' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600 mt-2">Manage and track all incoming orders</p>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === option.value
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {option.label}
                            {option.value !== 'all' && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                                    {orders.filter(o => o.status === option.value).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {getFilteredOrders().length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-500">No orders found</p>
                        </div>
                    ) : (
                        getFilteredOrders().map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Order #{order.order_number}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)} text-white`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Customer Information</p>
                                            <p className="text-sm text-gray-600 mt-1">{order.user?.full_name}</p>
                                            <p className="text-sm text-gray-600">{order.user?.phone}</p>
                                            <p className="text-sm text-gray-600 mt-2">Delivery Address:</p>
                                            <p className="text-sm text-gray-600">{order.delivery_address}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Order Items</p>
                                            <div className="mt-1 space-y-1">
                                                {order.items?.map((item) => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span>{item.quantity}x {item.menu_item?.name}</span>
                                                        <span>{parseFloat(item.subtotal).toLocaleString()}đ</span>
                                                    </div>
                                                ))}
                                                <div className="border-t pt-2 mt-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Subtotal</span>
                                                        <span>{(parseFloat(order.total_amount) - parseFloat(order.delivery_fee)).toLocaleString()}đ</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span>Delivery Fee</span>
                                                        <span>{parseFloat(order.delivery_fee).toLocaleString()}đ</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold mt-1">
                                                        <span>Total</span>
                                                        <span className="text-primary">{parseFloat(order.total_amount).toLocaleString()}đ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {order.notes && (
                                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                            <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                                            <p className="text-sm text-yellow-700">{order.notes}</p>
                                        </div>
                                    )}

                                    {/* Status Update Buttons */}
                                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                                disabled={order.status !== 'pending'}
                                                className={`px-3 py-1 rounded text-sm ${order.status === 'pending'
                                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                                disabled={!['confirmed', 'pending'].includes(order.status)}
                                                className={`px-3 py-1 rounded text-sm ${['confirmed', 'pending'].includes(order.status)
                                                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Start Preparing
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                                disabled={order.status !== 'preparing'}
                                                className={`px-3 py-1 rounded text-sm ${order.status === 'preparing'
                                                        ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Ready for Pickup
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'delivering')}
                                                disabled={order.status !== 'ready'}
                                                className={`px-3 py-1 rounded text-sm ${order.status === 'ready'
                                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Start Delivery
                                            </button>
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                disabled={order.status !== 'delivering'}
                                                className={`px-3 py-1 rounded text-sm ${order.status === 'delivering'
                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                Mark Delivered
                                            </button>
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                    className="px-3 py-1 rounded text-sm bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorOrders;