import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VendorMenu = () => {
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount_price: '',
        image_url: '',
        is_available: true,
        is_popular: false,
        preparation_time: 15,
    });

    useEffect(() => {
        fetchRestaurant();
    }, []);

    const fetchRestaurant = async () => {
        try {
            const response = await api.get('/restaurants/my-restaurant');
            console.log('Restaurant data:', response.data);

            if (response.data.success && response.data.restaurant) {
                setRestaurant(response.data.restaurant);
                fetchMenuItems(response.data.restaurant.id);
            } else {
                toast.error('Please create your restaurant first');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            if (error.response?.status === 404) {
                toast.error('Please create your restaurant first');
            }
            setLoading(false);
        }
    };

    const fetchMenuItems = async (restaurantId) => {
        try {
            const response = await api.get(`/menu-items/restaurant/${restaurantId}`);
            console.log('Menu items:', response.data);
            setMenuItems(response.data.menuItems || []);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            toast.error('Failed to load menu items');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Item name is required');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Valid price is required');
            return;
        }

        try {
            if (editingItem) {
                await api.put(`/menu-items/${editingItem.id}`, formData);
                toast.success('Menu item updated successfully');
            } else {
                await api.post('/menu-items', formData);
                toast.success('Menu item added successfully');
            }
            resetForm();
            if (restaurant?.id) {
                fetchMenuItems(restaurant.id);
            }
        } catch (error) {
            console.error('Error saving menu item:', error);
            toast.error(error.response?.data?.message || 'Failed to save menu item');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/menu-items/${id}`);
                toast.success('Menu item deleted successfully');
                fetchMenuItems(restaurant.id);
            } catch (error) {
                console.error('Error deleting menu item:', error);
                toast.error('Failed to delete menu item');
            }
        }
    };

    const handleToggleAvailability = async (item) => {
        try {
            await api.patch(`/menu-items/${item.id}/toggle`);
            toast.success(`Item is now ${!item.is_available ? 'available' : 'unavailable'}`);
            fetchMenuItems(restaurant.id);
        } catch (error) {
            console.error('Error toggling availability:', error);
            toast.error('Failed to update item status');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            discount_price: item.discount_price || '',
            image_url: item.image_url || '',
            is_available: item.is_available,
            is_popular: item.is_popular,
            preparation_time: item.preparation_time,
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            discount_price: '',
            image_url: '',
            is_available: true,
            is_popular: false,
            preparation_time: 15,
        });
        setEditingItem(null);
        setShowAddModal(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            No Restaurant Found
                        </h2>
                        <p className="text-gray-600 mb-6">
                            You need to create a restaurant before adding menu items.
                        </p>
                        <a
                            href="/vendor/profile"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-orange-600"
                        >
                            Create Restaurant
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                        <p className="text-gray-600 mt-2">
                            Manage your restaurant's menu items - {restaurant.name}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-orange-600 transition"
                        style={{ backgroundColor: '#ff6b35' }}
                    >
                        ➕ Add New Item
                    </button>
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img
                                src={item.image_url || 'https://via.placeholder.com/400x200'}
                                alt={item.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold">{item.name}</h3>
                                        {item.is_popular && (
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                                                Popular
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleToggleAvailability(item)}
                                        className={`px-2 py-1 rounded text-xs ${item.is_available
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {item.is_available ? 'Available' : 'Unavailable'}
                                    </button>
                                </div>

                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                    {item.description}
                                </p>

                                <div className="mt-3">
                                    {item.discount_price ? (
                                        <div>
                                            <span className="text-lg font-bold text-primary">
                                                {parseFloat(item.discount_price).toLocaleString()}đ
                                            </span>
                                            <span className="ml-2 text-sm text-gray-500 line-through">
                                                {parseFloat(item.price).toLocaleString()}đ
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-lg font-bold text-primary">
                                            {parseFloat(item.price).toLocaleString()}đ
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 mt-1">
                                    Prep time: {item.preparation_time} min
                                </p>

                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {menuItems.length === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-500">No menu items yet. Click "Add New Item" to get started.</p>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-4">
                                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Item Name *
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
                                            Price *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            step="1000"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount Price (optional)
                                        </label>
                                        <input
                                            type="number"
                                            name="discount_price"
                                            step="1000"
                                            value={formData.discount_price}
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preparation Time (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            name="preparation_time"
                                            value={formData.preparation_time}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="is_available"
                                                checked={formData.is_available}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Available
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="is_popular"
                                                checked={formData.is_popular}
                                                onChange={handleInputChange}
                                                className="mr-2"
                                            />
                                            Popular
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-orange-600"
                                        >
                                            {editingItem ? 'Update' : 'Add'} Item
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorMenu;