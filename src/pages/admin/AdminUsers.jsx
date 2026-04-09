import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await axios.put(`${API_URL}/admin/users/${userId}/status`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setUsers(users.map(u => u.id === userId ? { ...u, is_active: response.data.user.is_active } : u));
      toast.success('User status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-[#2d2d2d] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#252525] text-xs uppercase text-gray-300">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl border-b border-[#2d2d2d]">ID</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Name</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Email</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Role</th>
              <th className="px-6 py-4 border-b border-[#2d2d2d]">Status</th>
              <th className="px-6 py-4 rounded-tr-xl border-b border-[#2d2d2d]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-[#2d2d2d] hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 font-medium text-gray-200">#{user.id}</td>
                <td className="px-6 py-4">{user.full_name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded inline-flex text-xs font-semibold leading-5 ${
                    user.role === 'vendor' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded inline-flex text-xs font-semibold leading-5 ${
                    user.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.is_active ? 'Active' : 'Locked'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                      user.is_active 
                        ? 'text-red-400 hover:bg-red-500/10' 
                        : 'text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {user.is_active ? 'Lock' : 'Unlock'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
