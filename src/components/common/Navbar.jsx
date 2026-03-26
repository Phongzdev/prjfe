import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const { totalItems } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        setIsDropdownOpen(false);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl">🍕</span>
                        <span className="text-xl font-bold text-primary">QuickBite</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                {user.role === 'user' && (
                                    <>
                                        <Link to="/restaurants" className="text-gray-700 hover:text-primary">
                                            Restaurants
                                        </Link>
                                        <Link to="/cart" className="relative">
                                            <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
                                            {totalItems > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}

                                {user.role === 'vendor' && (
                                    <Link to="/vendor/dashboard" className="text-gray-700 hover:text-primary">
                                        Dashboard
                                    </Link>
                                )}

                                {/* Dropdown Menu - SỬA LẠI PHẦN NÀY */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 focus:outline-none"
                                    >
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                                            {user.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-gray-700">{user.full_name}</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                                            <Link
                                                to={user.role === 'vendor' ? '/vendor/profile' : '/profile'}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <div className="flex items-center">
                                                    <UserIcon className="h-4 w-4 mr-2" />
                                                    Profile
                                                </div>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
                                            >
                                                <div className="flex items-center">
                                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Logout
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-primary">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;