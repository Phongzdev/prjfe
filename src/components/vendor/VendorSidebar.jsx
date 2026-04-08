import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    QueueListIcon,
    UserCircleIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const VendorSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/vendor/dashboard', icon: HomeIcon },
        { name: 'Orders', href: '/vendor/orders', icon: ClipboardDocumentListIcon },
        { name: 'Menu', href: '/vendor/menu', icon: QueueListIcon },
        { name: 'Profile', href: '/vendor/profile', icon: UserCircleIcon },
    ];

    const navLinkClass = ({ isActive }) =>
        `flex items-center px-4 py-3 mx-2 my-1 rounded-lg text-sm font-medium transition-colors ${
            isActive
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-orange-50 hover:text-primary'
        }`;

    return (
        <aside className="w-64 bg-white shadow-xl h-screen sticky top-0 flex flex-col">
            <div className="flex items-center justify-center h-20 border-b">
                <div className="flex items-center space-x-2">
                    <span className="text-3xl">🍕</span>
                    <span className="text-2xl font-bold text-primary">QuickBite</span>
                </div>
            </div>
            
            <div className="flex-1 py-6 overflow-y-auto">
                <nav className="space-y-1">
                    {navigation.map((item) => (
                        <NavLink key={item.name} to={item.href} end={item.href === '/vendor/dashboard'} className={navLinkClass}>
                            <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default VendorSidebar;
