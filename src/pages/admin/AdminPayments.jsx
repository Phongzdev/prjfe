import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Filter for orders that have payment methods or statuses
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (id) => {
    if (!window.confirm('Confirm refund transaction?')) return;
    
    try {
      const response = await axios.post(`${API_URL}/admin/orders/${id}/refund`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(orders.map(o => o.id === id ? { ...o, payment_status: 'refunded', status: 'cancelled' } : o));
      toast.success('Payment refunded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Refund failed');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-[#2d2d2d] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#252525] text-xs uppercase text-gray-300">
            <tr>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Transaction ID / Order</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Amount</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Method</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Date</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Payment Status</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-[#2d2d2d] hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-200">
                  {order.stripe_payment_intent_id ? (
                    <span className="text-xs text-purple-400 block mb-1">Stripe: {order.stripe_payment_intent_id.substring(0, 12)}...</span>
                  ) : null}
                  Ord: {order.order_number}
                </td>
                <td className="px-6 py-4 font-bold text-gray-100">${Number(order.total_amount).toFixed(2)}</td>
                <td className="px-6 py-4 uppercase text-xs font-semibold">{order.payment_method}</td>
                <td className="px-6 py-4 text-xs">{new Date(order.created_at).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded inline-flex text-xs font-semibold leading-5 ${
                    order.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
                    order.payment_status === 'refunded' ? 'bg-blue-500/20 text-blue-400' :
                    order.payment_status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                     {order.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {order.payment_status === 'paid' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleRefund(order.id)}
                      className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors font-medium border border-red-500/30"
                    >
                      Process Refund
                    </button>
                  )}
                  {order.payment_status === 'refunded' && (
                    <span className="text-xs text-gray-500">Refunded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
