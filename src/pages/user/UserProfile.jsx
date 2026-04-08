import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getMe } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    PencilSquareIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const UserProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        email: '',
    });
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone || '',
                address: user.address || '',
                email: user.email || '',
            });
            fetchUserOrders();
        }
    }, [user]);

    const fetchUserOrders = async () => {
        try {
            const response = await api.get('/orders/my-orders');
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.put('/users/profile', {
                full_name: formData.full_name,
                phone: formData.phone,
                address: formData.address,
            });

            if (response.data.success) {
                toast.success('Profile updated successfully');
                dispatch(getMe());
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
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

    if (!user) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
                            {/* Avatar Section */}
                            <div className="bg-gradient-to-r from-primary to-orange-600 p-6 text-center">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl font-bold text-primary">
                                        {user.full_name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-white">{user.full_name}</h2>
                                <p className="text-white/80 text-sm mt-1">Member since {new Date(user.created_at).getFullYear()}</p>
                            </div>

                            {/* Stats Section */}
                            <div className="p-6 border-b">
                                <h3 className="font-semibold text-gray-900 mb-4">Order Statistics</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Orders</span>
                                        <span className="font-semibold">{orders.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Completed Orders</span>
                                        <span className="font-semibold text-green-600">
                                            {orders.filter(o => o.status === 'delivered').length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Spent</span>
                                        <span className="font-semibold text-primary">
                                            {orders
                                                .filter(o => o.status === 'delivered')
                                                .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
                                                .toLocaleString()}đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => navigate('/restaurants')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        🍕 Browse Restaurants
                                    </button>
                                    <button
                                        onClick={() => navigate('/cart')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        🛒 View Cart
                                    </button>
                                    <button
                                        onClick={() => navigate('/orders')}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        📦 My Orders
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 text-primary hover:text-orange-600"
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!isEditing ? (
                                // View Mode
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 border-b">
                                        <UserIcon className="h-5 w-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium">{user.full_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border-b">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border-b">
                                        <PhoneIcon className="h-5 w-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="font-medium">{user.phone || 'Not set'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3">
                                        <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Delivery Address</p>
                                            <p className="font-medium">{user.address || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Edit Mode
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            required
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter your phone number"
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Address
                                        </label>
                                        <textarea
                                            name="address"
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter your delivery address"
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <LoadingSpinner /> : <><CheckIcon className="h-5 w-5" /> Save Changes</>}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="text-primary hover:text-orange-600 text-sm"
                                >
                                    View All →
                                </button>
                            </div>

                            {ordersLoading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No orders yet</p>
                                    <button
                                        onClick={() => navigate('/restaurants')}
                                        className="mt-4 text-primary hover:text-orange-600"
                                    >
                                        Start Ordering
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.slice(0, 3).map((order) => (
                                        <div
                                            key={order.id}
                                            className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                                            onClick={() => navigate(`/track-order/${order.id}`)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">Order #{order.order_number}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        {order.items?.length} item(s) • {parseFloat(order.total_amount).toLocaleString()}đ
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;