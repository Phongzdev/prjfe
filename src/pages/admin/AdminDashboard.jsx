import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data.stats);
      setTopRestaurants(response.data.topRestaurants);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${Number(stats?.totalRevenue || 0).toFixed(2)}`} color="text-green-400" />
        <StatCard title="Total Orders" value={stats?.totalOrders || 0} color="text-blue-400" />
        <StatCard title="Total Users" value={stats?.totalUsers || 0} color="text-purple-400" />
        <StatCard title="Total Restaurants" value={stats?.totalRestaurants || 0} color="text-pink-400" />
      </div>

      {/* Top Restaurants */}
      <div className="bg-[#1e1e1e] rounded-xl border border-[#2d2d2d] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2d2d2d]">
          <h3 className="text-lg font-semibold text-gray-100">Top Rated Restaurants</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topRestaurants.map((restaurant, index) => (
              <div key={restaurant.id} className="flex items-center justify-between p-4 bg-[#2d2d2d] rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">{restaurant.name}</h4>
                    <p className="text-sm text-gray-400">{restaurant.total_ratings} ratings</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-yellow-400">
                    <span className="font-bold">{Number(restaurant.rating).toFixed(1)}</span>
                    <span className="text-xs ml-1">⭐</span>
                  </div>
                </div>
              </div>
            ))}
            {topRestaurants.length === 0 && (
              <p className="text-gray-400 text-center py-4">No restaurants found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2d2d2d] shadow-sm">
    <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AdminDashboard;
