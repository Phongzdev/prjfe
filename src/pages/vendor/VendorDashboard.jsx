import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const VendorDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState(null);
    const [newOrderAlert, setNewOrderAlert] = useState(null);

    useEffect(() => {
        fetchRestaurant();
        fetchStats();
        fetchRecentOrders();
        setupSocket();
    }, []);

    const setupSocket = () => {
        const socket = getSocket();
        if (!socket) return;

        // Join restaurant room
        if (restaurant?.id) {
            socket.emit('join-restaurant', restaurant.id);
        }

        // Listen for new orders
        socket.on('new-order', (data) => {
            console.log('New order:', data);
            setNewOrderAlert(data);
            toast.success(`🆕 New Order #${data.orderNumber}!`, {
                duration: 5000,
                position: 'top-right',
            });
            // Refresh stats and orders
            fetchStats();
            fetchRecentOrders();

            // Auto hide alert after 5 seconds
            setTimeout(() => setNewOrderAlert(null), 5000);
        });

        // Listen for order updates
        socket.on('order-updated', () => {
            fetchStats();
            fetchRecentOrders();
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
            if (error.response?.status === 404) {
                toast.error('Please create your restaurant first');
            }
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/orders/vendor/orders');
            const orders = response.data.orders || [];

            const totalRevenue = orders.reduce((sum, order) => {
                if (order.status === 'delivered') {
                    return sum + parseFloat(order.total_amount);
                }
                return sum;
            }, 0);

            const pendingOrders = orders.filter(o =>
                ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(o.status)
            ).length;

            const completedOrders = orders.filter(o =>
                o.status === 'delivered'
            ).length;

            setStats({
                totalOrders: orders.length,
                totalRevenue: totalRevenue,
                pendingOrders: pendingOrders,
                completedOrders: completedOrders,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchRecentOrders = async () => {
        try {
            const response = await api.get('/orders/vendor/orders?limit=5');
            setRecentOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching recent orders:', error);
        } finally {
            setLoading(false);
        }
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

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Welcome to QuickBite Vendor!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You haven't created your restaurant yet.
                        </p>
                        <Link
                            to="/vendor/profile"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-orange-600"
                        >
                            Create Your Restaurant
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* New Order Alert */}
            {newOrderAlert && (
                <div className="fixed top-20 right-4 z-50 animate-bounce">
                    <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
                        <p className="font-bold text-lg">🆕 New Order!</p>
                        <p>Order #{newOrderAlert.orderNumber}</p>
                        <p>Total: {newOrderAlert.totalAmount?.toLocaleString()}đ</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Welcome back, {user?.full_name}! Manage your restaurant here.
                    </p>
                </div>

                {/* Restaurant Info */}
                {/* Restaurant Info */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                            <p className="text-gray-600 mt-1">{restaurant.address}</p>
                            <div className="flex items-center mt-2">
                                <span className="text-yellow-500">★</span>
                                <span className="ml-1 text-gray-600">
                                    {restaurant.rating} ({restaurant.total_ratings} reviews)
                                </span>
                                <span className={`ml-4 px-2 py-1 rounded-full text-xs ${restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {restaurant.is_active ? 'Open' : 'Closed'}
                                </span>
                            </div>
                            {/* Thêm nút Manage Menu vào đây */}
                            <div className="flex gap-3 mt-4">
                                <Link
                                    to="/vendor/menu"
                                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition"
                                >
                                    📋 Manage Menu
                                </Link>
                                <Link
                                    to="/vendor/orders"
                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                >
                                    📦 View Orders
                                </Link>
                            </div>
                        </div>
                        <Link
                            to="/vendor/profile"
                            className="text-primary hover:text-orange-600"
                        >
                            Edit Profile →
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-600">
                            {stats.totalRevenue.toLocaleString()}đ
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Pending Orders</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-500 text-sm">Completed Orders</p>
                        <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <Link to="/vendor/orders" className="text-primary hover:text-orange-600">
                            View All →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">Order #{order.order_number}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.created_at).toLocaleString()}
                                            </p>
                                            <p className="text-sm mt-1">
                                                Customer: {order.user?.full_name}
                                            </p>
                                            <p className="text-sm font-medium mt-1">
                                                Total: {parseFloat(order.total_amount).toLocaleString()}đ
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)} text-white`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;