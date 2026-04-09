import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/restaurants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRestaurants(response.data.restaurants);
    } catch (error) {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/admin/restaurants/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRestaurants(restaurants.map(r => r.id === id ? { ...r, is_active: response.data.restaurant.is_active } : r));
      toast.success('Restaurant status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-[#2d2d2d] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#252525] text-xs uppercase text-gray-300">
            <tr>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Restaurant Name</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Vendor Email</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Rating</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Status</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map(restaurant => (
              <tr key={restaurant.id} className="border-b border-[#2d2d2d] hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-200">
                  <div className="flex items-center space-x-3">
                    {restaurant.image_url ? (
                      <img src={restaurant.image_url} alt="Rest" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">R</div>
                    )}
                    <span>{restaurant.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{restaurant.vendor?.email}</td>
                <td className="px-6 py-4 text-yellow-400 font-medium">⭐ {Number(restaurant.rating).toFixed(1)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded inline-flex text-xs font-semibold leading-5 ${
                    restaurant.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {restaurant.is_active ? 'Active' : 'Locked'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleStatus(restaurant.id)}
                    className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                      restaurant.is_active 
                        ? 'text-red-400 hover:bg-red-500/10' 
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {restaurant.is_active ? 'Lock' : 'Approve/Unlock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRestaurants;
