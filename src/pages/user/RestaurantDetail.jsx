import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../services/api';
import { addToCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RestaurantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [quantities, setQuantities] = useState({});
    const [specialInstructions, setSpecialInstructions] = useState({});

    useEffect(() => {
        fetchRestaurant();
        fetchMenu();
    }, [id]);

    const fetchRestaurant = async () => {
        try {
            const response = await api.get(`/restaurants/${id}`);
            setRestaurant(response.data.restaurant);
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            toast.error('Failed to load restaurant');
        }
    };

    const fetchMenu = async () => {
        try {
            const response = await api.get(`/menu-items/restaurant/${id}`);
            setMenuItems(response.data.menuItems || []);
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (itemId, delta) => {
        setQuantities(prev => ({
            ...prev,
            [itemId]: Math.max(0, (prev[itemId] || 0) + delta)
        }));
    };

    const handleInstructionChange = (itemId, value) => {
        setSpecialInstructions(prev => ({
            ...prev,
            [itemId]: value
        }));
    };

    const handleAddToCart = async (item) => {
        if (!user) {
            toast.error('Please login to order');
            navigate('/login');
            return;
        }

        const quantity = quantities[item.id] || 1;
        if (quantity === 0) {
            toast.error('Please select quantity');
            return;
        }

        try {
            await dispatch(addToCart({
                menu_item_id: item.id,
                quantity: quantity,
                special_instructions: specialInstructions[item.id] || ''
            })).unwrap();

            toast.success(`Added ${quantity}x ${item.name} to cart`);
            setQuantities(prev => ({ ...prev, [item.id]: 0 }));
            setSpecialInstructions(prev => ({ ...prev, [item.id]: '' }));
        } catch (error) {
            toast.error(error.message || 'Failed to add to cart');
        }
    };

    const categories = ['all', ...new Set(menuItems.map(item => item.category?.name || 'Uncategorized'))];
    const filteredItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter(item => (item.category?.name || 'Uncategorized') === selectedCategory);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Restaurant Header */}
            {restaurant && (
                <div className="relative h-64 md:h-96">
                    <img
                        src={restaurant.image_url || 'https://via.placeholder.com/1200x400'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-3xl md:text-4xl font-bold">{restaurant.name}</h1>
                            <p className="mt-2 text-gray-200">{restaurant.description}</p>
                            <div className="flex items-center mt-4 space-x-4">
                                <div className="flex items-center">
                                    <span className="text-yellow-400">★</span>
                                    <span className="ml-1">{restaurant.rating} ({restaurant.total_ratings} reviews)</span>
                                </div>
                                <span>•</span>
                                <span>{restaurant.address}</span>
                                <span>•</span>
                                <span>{restaurant.phone}</span>
                                <span>•</span>
                                <span className={restaurant.is_active ? 'text-green-400' : 'text-red-400'}>
                                    {restaurant.is_active ? 'Open Now' : 'Closed'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Category Filter */}
                <div className="flex overflow-x-auto space-x-2 pb-4 mb-6">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${selectedCategory === cat
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {cat === 'all' ? 'All Items' : cat}
                        </button>
                    ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
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
                                    <div className="text-right">
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
                                </div>

                                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                    {item.description}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                    Prep time: {item.preparation_time} min
                                </p>

                                {item.is_available ? (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, -1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                disabled={(quantities[item.id] || 0) <= 0}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">
                                                {quantities[item.id] || 0}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Special instructions (optional)"
                                            value={specialInstructions[item.id] || ''}
                                            onChange={(e) => handleInstructionChange(item.id, e.target.value)}
                                            className="w-full border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />

                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={(quantities[item.id] || 0) === 0}
                                            className={`w-full py-2 rounded-lg font-medium transition ${(quantities[item.id] || 0) > 0
                                                    ? 'bg-primary text-white hover:bg-orange-600'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 p-2 bg-red-50 text-red-600 text-center rounded-lg">
                                        Currently Unavailable
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No menu items available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetail;