import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import { initSocket, disconnectSocket } from './services/socket';

// Pages
import AuthPage from './pages/AuthPage';
import HomePage from './pages/user/HomePage';
import RestaurantDetail from './pages/user/RestaurantDetail';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';
import UserProfile from './pages/user/UserProfile';
import PaymentCallback from './pages/PaymentCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorOrders from './pages/vendor/VendorOrders';
import VendorMenu from './pages/vendor/VendorMenu';
import VendorProfile from './pages/vendor/VendorProfile';

// Admin Pages - To be created
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminMenuItems from './pages/admin/AdminMenuItems';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminVouchers from './pages/admin/AdminVouchers';

// Layouts
import UserLayout from './layouts/UserLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'vendor') return '/vendor/dashboard';
  return '/';
};

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    return <Navigate to={getDashboardPath(user?.role)} />;
  }

  return children;
};

// Check Auth - Routes that already logged in users shouldn't see
const AuthRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (token) {
    return <Navigate to={getDashboardPath(user?.role)} />;
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

      <Routes>
        {/* User Layout encompasses public and user-specific pages */}
        <Route element={<UserLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          } />
          <Route path="/register" element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/restaurants" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />

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
          <Route path="/profile" element={
            <ProtectedRoute role="user">
              <UserProfile />
            </ProtectedRoute>
          } />
        </Route>

        {/* Vendor Layout encompasses all vendor pages */}
        <Route element={<VendorLayout />}>
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
        </Route>

        {/* Admin Layout encompasses all admin pages */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/restaurants" element={
            <ProtectedRoute role="admin">
              <AdminRestaurants />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu-items" element={
            <ProtectedRoute role="admin">
              <AdminMenuItems />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute role="admin">
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute role="admin">
              <AdminPayments />
            </ProtectedRoute>
          } />
          <Route path="/admin/vouchers" element={
            <ProtectedRoute role="admin">
              <AdminVouchers />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;