import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        is_active: 'all', // 'all', 'open', 'closed'
        rating: 'all', // 'all', '4', '3', '2'
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filters, restaurants]);

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/restaurants');
            setRestaurants(response.data.restaurants || []);
            setFilteredRestaurants(response.data.restaurants || []);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...restaurants];

        // Search by name or description
        if (searchTerm.trim()) {
            filtered = filtered.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status (open/closed)
        if (filters.is_active !== 'all') {
            filtered = filtered.filter(restaurant =>
                filters.is_active === 'open' ? restaurant.is_active : !restaurant.is_active
            );
        }

        // Filter by rating
        if (filters.rating !== 'all') {
            const minRating = parseInt(filters.rating);
            filtered = filtered.filter(restaurant =>
                parseFloat(restaurant.rating) >= minRating
            );
        }

        setFilteredRestaurants(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            is_active: 'all',
            rating: 'all',
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-orange-600 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Delicious Food, Delivered Fast
                    </h1>
                    <p className="text-white text-lg mb-8">
                        Order from the best restaurants in your area
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search restaurants by name or cuisine..."
                                    className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                Filters
                            </button>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="mt-4 bg-white rounded-lg p-4 shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Restaurant Status
                                        </label>
                                        <select
                                            value={filters.is_active}
                                            onChange={(e) => handleFilterChange('is_active', e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="all">All</option>
                                            <option value="open">Open Now</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>

                                    {/* Rating Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Rating
                                        </label>
                                        <select
                                            value={filters.rating}
                                            onChange={(e) => handleFilterChange('rating', e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="all">All Ratings</option>
                                            <option value="4">4★ & above</option>
                                            <option value="3">3★ & above</option>
                                            <option value="2">2★ & above</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="text-primary hover:text-orange-600 text-sm"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'Restaurant' : 'Restaurants'} found
                    </h2>
                    {searchTerm && (
                        <p className="text-gray-500">
                            Searching for: "{searchTerm}"
                        </p>
                    )}
                </div>

                {/* Restaurants Grid */}
                {filteredRestaurants.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-500 text-lg mb-4">No restaurants found</p>
                        <button
                            onClick={clearFilters}
                            className="text-primary hover:text-orange-600"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRestaurants.map((restaurant) => (
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
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {restaurant.name}
                                        </h3>
                                        {!restaurant.is_active && (
                                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                        {restaurant.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center">
                                            <span className="text-yellow-500">★</span>
                                            <span className="ml-1 text-sm text-gray-600">
                                                {restaurant.rating} ({restaurant.total_ratings} reviews)
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {restaurant.address?.split(',')[0]}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;