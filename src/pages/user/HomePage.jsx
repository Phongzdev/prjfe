import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/restaurants');
            setRestaurants(response.data.restaurants);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get(`/restaurants?search=${search}`);
            setRestaurants(response.data.restaurants);
        } catch (error) {
            console.error('Error searching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl p-8 mb-12 text-white">
                <h1 className="text-4xl font-bold mb-4">Delicious Food, Delivered Fast</h1>
                <p className="text-lg mb-6">Order from the best restaurants in your area</p>

                <form onSubmit={handleSearch} className="max-w-md">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search restaurants..."
                            className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Restaurants Grid */}
            <h2 className="text-2xl font-bold mb-6">Popular Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                    <Link
                        key={restaurant.id}
                        to={`/restaurant/${restaurant.id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <img
                            src={restaurant.image_url || 'https://via.placeholder.com/400x200'}
                            alt={restaurant.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{restaurant.description}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-yellow-500">★</span>
                                    <span className="ml-1 text-sm text-gray-600">
                                        {restaurant.rating} ({restaurant.total_ratings} reviews)
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {restaurant.is_active ? '🟢 Open' : '🔴 Closed'}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {restaurants.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No restaurants found</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;