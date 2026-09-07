import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import FarmerLayout from '../layouts/FarmerLayout';
import BuyerLayout from '../layouts/BuyerLayout';
import AdminLayout from '../layouts/AdminLayout';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Public Pages
import Home from '../pages/Public/Home';
import About from '../pages/Public/About';
import Contact from '../pages/Public/Contact';
import Marketplace from '../pages/Public/Marketplace';
import ProductDetails from '../pages/Public/ProductDetails';
import Login from '../pages/Public/Login';
import Register from '../pages/Public/Register';

// Farmer Pages
import FarmerDashboard from '../pages/Farmer/FarmerDashboard';
import FarmerProfileView from '../pages/Farmer/FarmerProfileView';
import FarmerEditProfile from '../pages/Farmer/FarmerEditProfile';
import AddProduct from '../pages/Farmer/AddProduct';
import MyProducts from '../pages/Farmer/MyProducts';
import EditProduct from '../pages/Farmer/EditProduct';
import FarmerOrders from '../pages/Farmer/FarmerOrders';
import FarmerOrderDetail from '../pages/Farmer/FarmerOrderDetail';
import FarmerNotifications from '../pages/Farmer/FarmerNotifications';

// Buyer Pages
import BuyerDashboard from '../pages/Buyer/BuyerDashboard';
import CartPage from '../pages/Buyer/CartPage';
import CheckoutPage from '../pages/Buyer/CheckoutPage';
import BuyerOrders from '../pages/Buyer/BuyerOrders';
import BuyerOrderDetail from '../pages/Buyer/BuyerOrderDetail';
import BuyerProfileView from '../pages/Buyer/BuyerProfileView';
import BuyerEditProfile from '../pages/Buyer/BuyerEditProfile';
import BuyerNotifications from '../pages/Buyer/BuyerNotifications';
import WishlistPage from '../pages/Buyer/WishlistPage';

// Admin Pages
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import ManageUsers from '../pages/Admin/ManageUsers';
import ManageFarmers from '../pages/Admin/ManageFarmers';
import ManageBuyers from '../pages/Admin/ManageBuyers';
import ManageProducts from '../pages/Admin/ManageProducts';
import ManageOrders from '../pages/Admin/ManageOrders';
import ManageCategories from '../pages/Admin/ManageCategories';
import ReportsAnalytics from '../pages/Admin/ReportsAnalytics';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/cart" element={<RoleRoute allowedRoles={['buyer']}><CartPage /></RoleRoute>} />
        <Route path="/checkout" element={<RoleRoute allowedRoles={['buyer']}><CheckoutPage /></RoleRoute>} />
      </Route>

      {/* Farmer Layout Routes */}
      <Route
        element={
          <RoleRoute allowedRoles={['farmer']}>
            <FarmerLayout />
          </RoleRoute>
        }
      >
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/profile" element={<FarmerProfileView />} />
        <Route path="/farmer/profile/edit" element={<FarmerEditProfile />} />
        <Route path="/farmer/products" element={<MyProducts />} />
        <Route path="/farmer/products/add" element={<AddProduct />} />
        <Route path="/farmer/products/:id/edit" element={<EditProduct />} />
        <Route path="/farmer/orders" element={<FarmerOrders />} />
        <Route path="/farmer/orders/:id" element={<FarmerOrderDetail />} />
        <Route path="/farmer/notifications" element={<FarmerNotifications />} />
      </Route>

      {/* Buyer Layout Routes */}
      <Route
        element={
          <RoleRoute allowedRoles={['buyer']}>
            <BuyerLayout />
          </RoleRoute>
        }
      >
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/orders" element={<BuyerOrders />} />
        <Route path="/buyer/orders/:id" element={<BuyerOrderDetail />} />
        <Route path="/buyer/profile" element={<BuyerProfileView />} />
        <Route path="/buyer/profile/edit" element={<BuyerEditProfile />} />
        <Route path="/buyer/notifications" element={<BuyerNotifications />} />
        <Route path="/buyer/wishlist" element={<WishlistPage />} />
      </Route>

      {/* Admin Layout Routes */}
      <Route
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/farmers" element={<ManageFarmers />} />
        <Route path="/admin/buyers" element={<ManageBuyers />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/orders" element={<ManageOrders />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/analytics" element={<ReportsAnalytics />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
            <h1 className="text-6xl font-black text-primary-400">404</h1>
            <h2 className="text-2xl font-bold text-slate-100">Page Not Found</h2>
            <p className="text-xs text-slate-400 max-w-sm">The page you are looking for doesn't exist or has been moved.</p>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
