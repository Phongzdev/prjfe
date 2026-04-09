import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  ChartPieIcon, 
  UsersIcon, 
  BuildingStorefrontIcon, 
  CakeIcon, 
  ShoppingBagIcon, 
  CreditCardIcon, 
  TicketIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ChartPieIcon },
    { name: 'Users', path: '/admin/users', icon: UsersIcon },
    { name: 'Restaurants', path: '/admin/restaurants', icon: BuildingStorefrontIcon },
    { name: 'Menu Items', path: '/admin/menu-items', icon: CakeIcon },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBagIcon },
    { name: 'Payments', path: '/admin/payments', icon: CreditCardIcon },
    { name: 'Vouchers', path: '/admin/vouchers', icon: TicketIcon },
  ];

  return (
    <div className="flex h-screen bg-[#121212] text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center border-b border-[#2d2d2d]">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            QuickBite Admin
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${
                      isActive 
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                        : 'text-gray-400 hover:text-gray-100 hover:bg-[#2d2d2d]'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-purple-400' : 'group-hover:text-gray-100'}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#2d2d2d]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-[#1e1e1e]/80 backdrop-blur-md border-b border-[#2d2d2d] sticky top-0 z-10 flex items-center px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-100 tracking-wide">
            {navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Admin Panel'}
          </h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
