import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminMenuItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/menu-items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setItems(response.data.menuItems);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/admin/menu-items/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setItems(items.map(i => i.id === id ? { ...i, is_available: response.data.item.is_available } : i));
      toast.success('Item status updated');
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
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Item</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Restaurant</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Price</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Status</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-[#2d2d2d] hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-200">
                  <div className="flex items-center space-x-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt="Item" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">?</div>
                    )}
                    <span>{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{item.restaurant?.name}</td>
                <td className="px-6 py-4">${Number(item.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded inline-flex text-xs font-semibold leading-5 ${
                    item.is_available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {item.is_available ? 'Available' : 'Hidden'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleStatus(item.id)}
                    className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                      item.is_available 
                        ? 'text-red-400 hover:bg-red-500/10' 
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {item.is_available ? 'Hide' : 'Show'}
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

export default AdminMenuItems;
