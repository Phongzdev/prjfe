import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import { initSocket, disconnectSocket } from './services/socket';

// Components
import Navbar from './components/common/Navbar';

// Pages
import AuthPage from './pages/AuthPage';
import HomePage from './pages/user/HomePage';
import RestaurantDetail from './pages/user/RestaurantDetail';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorMenu from './pages/vendor/VendorMenu';
import VendorProfile from './pages/vendor/VendorProfile';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'vendor' ? '/vendor/dashboard' : '/'} />;
  }

  return children;
};

function App() {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (user && token) {
      dispatch(fetchCart());

      // Initialize socket connection
      const socket = initSocket(user.id);

      return () => {
        disconnectSocket();
      };
    }
  }, [user, token, dispatch]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/restaurants" element={<HomePage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />

        {/* User Routes */}
        <Route path="/cart" element={
          <ProtectedRoute role="user">
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute role="user">
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/track-order/:orderId" element={
          <ProtectedRoute role="user">
            <OrderTrackingPage />
          </ProtectedRoute>
        } />

        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={
          <ProtectedRoute role="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/vendor/orders" element={
          <ProtectedRoute role="vendor">
            <VendorOrders />
          </ProtectedRoute>
        } />
        <Route path="/vendor/menu" element={
          <ProtectedRoute role="vendor">
            <VendorMenu />
          </ProtectedRoute>
        } />
        <Route path="/vendor/profile" element={
          <ProtectedRoute role="vendor">
            <VendorProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;