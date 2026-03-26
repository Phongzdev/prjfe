import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'user',
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let result;
        if (isLogin) {
            result = await dispatch(login({ email: formData.email, password: formData.password }));
        } else {
            result = await dispatch(register(formData));
        }

        if (result.payload?.success) {
            toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
            navigate(result.payload.user.role === 'vendor' ? '/vendor/dashboard' : '/restaurants');
        } else {
            toast.error(result.payload?.message || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create new account'}
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>

                        {!isLogin && (
                            <>
                                <div>
                                    <input
                                        type="text"
                                        name="full_name"
                                        required
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Phone Number"
                                    />
                                </div>
                                <div>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    >
                                        <option value="user">Customer</option>
                                        <option value="vendor">Restaurant Owner</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary hover:text-orange-600"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthPage;