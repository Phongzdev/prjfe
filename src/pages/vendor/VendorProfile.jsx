import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        image_url: '',
        opening_time: '',
        closing_time: '',
    });

    useEffect(() => {
        fetchRestaurant();
    }, []);

    const fetchRestaurant = async () => {
        try {
            const response = await api.get('/restaurants/my-restaurant');
            setRestaurant(response.data.restaurant);
            setFormData({
                name: response.data.restaurant.name,
                description: response.data.restaurant.description || '',
                address: response.data.restaurant.address,
                phone: response.data.restaurant.phone || '',
                image_url: response.data.restaurant.image_url || '',
                opening_time: response.data.restaurant.opening_time || '',
                closing_time: response.data.restaurant.closing_time || '',
            });
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            if (error.response?.status === 404) {
                // No restaurant yet, that's fine
                setRestaurant(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (restaurant) {
                // Update existing restaurant
                await api.put('/restaurants', formData);
                toast.success('Restaurant updated successfully');
            } else {
                // Create new restaurant
                await api.post('/restaurants', formData);
                toast.success('Restaurant created successfully');
            }
            setIsEditing(false);
            fetchRestaurant();
        } catch (error) {
            console.error('Error saving restaurant:', error);
            toast.error(error.response?.data?.message || 'Failed to save restaurant');
        }
    };

    const toggleRestaurantStatus = async () => {
        try {
            const response = await api.patch('/restaurants/toggle-status');
            toast.success(response.data.message);
            fetchRestaurant();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Restaurant Profile</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your restaurant information
                    </p>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                    <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {user?.full_name}</p>
                        <p><span className="font-medium">Email:</span> {user?.email}</p>
                        <p><span className="font-medium">Phone:</span> {user?.phone || 'Not set'}</p>
                    </div>
                </div>

                {/* Restaurant Info Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">Restaurant Information</h2>
                        {restaurant && (
                            <button
                                onClick={toggleRestaurantStatus}
                                className={`px-3 py-1 rounded-full text-sm ${restaurant.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {restaurant.is_active ? 'Open' : 'Closed'}
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div>
                            {restaurant ? (
                                <div className="space-y-4">
                                    {restaurant.image_url && (
                                        <img
                                            src={restaurant.image_url}
                                            alt={restaurant.name}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">Restaurant Name</p>
                                        <p className="text-gray-600">{restaurant.name}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Description</p>
                                        <p className="text-gray-600">{restaurant.description || 'No description'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Address</p>
                                        <p className="text-gray-600">{restaurant.address}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Phone</p>
                                        <p className="text-gray-600">{restaurant.phone || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Operating Hours</p>
                                        <p className="text-gray-600">
                                            {restaurant.opening_time && restaurant.closing_time
                                                ? `${restaurant.opening_time} - ${restaurant.closing_time}`
                                                : 'Not set'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Rating</p>
                                        <p className="text-gray-600">
                                            ★ {restaurant.rating} ({restaurant.total_ratings} reviews)
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full mt-4 bg-primary text-white py-2 rounded-lg hover:bg-orange-600"
                                    >
                                        Edit Restaurant Info
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">
                                        You haven't created your restaurant yet.
                                    </p>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                                    >
                                        Create Restaurant
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Restaurant Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Opening Time
                                    </label>
                                    <input
                                        type="time"
                                        name="opening_time"
                                        value={formData.opening_time}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Closing Time
                                    </label>
                                    <input
                                        type="time"
                                        name="closing_time"
                                        value={formData.closing_time}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-orange-600"
                                >
                                    {restaurant ? 'Update' : 'Create'} Restaurant
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        if (restaurant) {
                                            setFormData({
                                                name: restaurant.name,
                                                description: restaurant.description || '',
                                                address: restaurant.address,
                                                phone: restaurant.phone || '',
                                                image_url: restaurant.image_url || '',
                                                opening_time: restaurant.opening_time || '',
                                                closing_time: restaurant.closing_time || '',
                                            });
                                        }
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorProfile;