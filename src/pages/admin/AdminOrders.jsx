import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/admin/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(orders.map(o => o.id === id ? { ...o, status: response.data.order.status } : o));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRefund = async (id) => {
    if (!window.confirm('Are you sure you want to refund this order?')) return;
    
    try {
      const response = await axios.post(`${API_URL}/admin/orders/${id}/refund`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setOrders(orders.map(o => o.id === id ? { ...o, payment_status: 'refunded', status: 'cancelled' } : o));
      toast.success('Order refunded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to refund order');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-[#2d2d2d] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#252525] text-xs uppercase text-gray-300">
            <tr>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Order ID</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">User</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Restaurant</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Amount</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Status</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-[#2d2d2d] hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-200">
                  <div className="flex flex-col">
                    <span>{order.order_number}</span>
                    <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{order.user?.email}</td>
                <td className="px-6 py-4">{order.restaurant?.name}</td>
                <td className="px-6 py-4 font-medium">${Number(order.total_amount).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded inline-flex text-xs font-semibold leading-5 ${
                    order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                    order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                  <div className="text-xs mt-1 text-gray-500">
                    Payment: <span className={order.payment_status === 'paid' ? 'text-emerald-400' : order.payment_status === 'refunded' ? 'text-blue-400' : 'text-gray-400'}>
                      {order.payment_status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-[#333] border border-[#444] text-xs text-gray-200 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivering">Delivering</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {order.payment_status === 'paid' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleRefund(order.id)}
                        className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
