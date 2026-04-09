import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: '', name: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', start_date: '', end_date: '', usage_limit: ''
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/vouchers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVouchers(response.data.vouchers);
    } catch (error) {
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const response = await axios.put(`${API_URL}/admin/vouchers/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVouchers(vouchers.map(v => v.id === id ? { ...v, is_active: response.data.voucher.is_active } : v));
      toast.success('Voucher status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newVoucher, 
        min_order_amount: newVoucher.min_order_amount ? Number(newVoucher.min_order_amount) : 0,
        max_discount: newVoucher.max_discount ? Number(newVoucher.max_discount) : null,
        usage_limit: newVoucher.usage_limit ? Number(newVoucher.usage_limit) : 0,
        discount_value: Number(newVoucher.discount_value)
      };

      const response = await axios.post(`${API_URL}/admin/vouchers`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVouchers([response.data.voucher, ...vouchers]);
      setShowModal(false);
      setNewVoucher({ code: '', name: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', max_discount: '', start_date: '', end_date: '', usage_limit: '' });
      toast.success('Voucher created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create voucher');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-[#2d2d2d] overflow-hidden">
      <div className="p-6 border-b border-[#2d2d2d] flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-100">Voucher Management</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          + Create Voucher
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-[#1e1e1e] rounded-xl border border-[#2d2d2d] w-full max-w-2xl my-8">
            <div className="p-4 border-b border-[#2d2d2d] flex justify-between items-center text-gray-100">
              <h3 className="font-semibold">Create New Voucher</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreateVoucher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Code</label>
                  <input required type="text" value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. SUMMER50" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name</label>
                  <input required type="text" value={newVoucher.name} onChange={e => setNewVoucher({...newVoucher, name: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Summer Discount" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea value={newVoucher.description} onChange={e => setNewVoucher({...newVoucher, description: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Voucher description" rows={2} />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Discount Type</label>
                  <select value={newVoucher.discount_type} onChange={e => setNewVoucher({...newVoucher, discount_type: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Mount ($/VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Discount Value</label>
                  <input required type="number" step="0.01" value={newVoucher.discount_value} onChange={e => setNewVoucher({...newVoucher, discount_value: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. 20" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max Discount (if %)</label>
                  <input type="number" step="0.01" value={newVoucher.max_discount} onChange={e => setNewVoucher({...newVoucher, max_discount: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50" placeholder="No limit" disabled={newVoucher.discount_type === 'fixed'} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Min Order Amount</label>
                  <input type="number" step="0.01" value={newVoucher.min_order_amount} onChange={e => setNewVoucher({...newVoucher, min_order_amount: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. 50000" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Usage Limit</label>
                  <input type="number" value={newVoucher.usage_limit} onChange={e => setNewVoucher({...newVoucher, usage_limit: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="0 = unlimited" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                  <input required type="datetime-local" value={newVoucher.start_date} onChange={e => setNewVoucher({...newVoucher, start_date: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End Date</label>
                  <input required type="datetime-local" value={newVoucher.end_date} onChange={e => setNewVoucher({...newVoucher, end_date: e.target.value})} className="w-full bg-[#2a2a2a] border border-[#3d3d3d] text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
              </div>
              <div className="pt-4 border-t border-[#2d2d2d] flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">Save Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#252525] text-xs uppercase text-gray-300">
            <tr>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Code</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Discount</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Usage Limit</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Valid Until</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Status</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map(voucher => (
              <tr key={voucher.id} className="border-b border-[#2d2d2d] hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 font-bold text-purple-400">{voucher.code}</td>
                <td className="px-6 py-4">
                  {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `$${voucher.discount_value}`}
                </td>
                <td className="px-6 py-4">{voucher.used_count} / {voucher.usage_limit || '∞'}</td>
                <td className="px-6 py-4">{new Date(voucher.end_date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded inline-flex text-xs font-semibold leading-5 ${
                    voucher.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {voucher.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleStatus(voucher.id)}
                    className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                      voucher.is_active 
                        ? 'text-red-400 hover:bg-red-500/10' 
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {voucher.is_active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr><td colSpan="6" className="text-center py-6">No vouchers created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVouchers;
