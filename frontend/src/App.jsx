import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import {
  PublicRoute,
  ProtectedRoute,
  FarmerRoute,
  BuyerRoute,
  AdminRoute,
} from './components/routes/RouteGuards';

// Public Pages
import Home from './pages/Public/Home';
import About from './pages/Public/About';
import Contact from './pages/Public/Contact';
import Marketplace from './pages/Public/Marketplace';
import ProductDetails from './pages/Public/ProductDetails';
import Login from './pages/Public/Login';
import Register from './pages/Public/Register';

// Farmer Pages
import FarmerDashboard from './pages/Farmer/FarmerDashboard';
import FarmerProfileView from './pages/Farmer/FarmerProfileView';
import FarmerEditProfile from './pages/Farmer/FarmerEditProfile';
import AddProduct from './pages/Farmer/AddProduct';
import MyProducts from './pages/Farmer/MyProducts';
import EditProduct from './pages/Farmer/EditProduct';
import FarmerOrders from './pages/Farmer/FarmerOrders';
import FarmerOrderDetail from './pages/Farmer/FarmerOrderDetail';
import FarmerNotifications from './pages/Farmer/FarmerNotifications';

// Buyer Pages
import BuyerDashboard from './pages/Buyer/BuyerDashboard';
import CartPage from './pages/Buyer/CartPage';
import CheckoutPage from './pages/Buyer/CheckoutPage';
import BuyerOrders from './pages/Buyer/BuyerOrders';
import BuyerOrderDetail from './pages/Buyer/BuyerOrderDetail';
import BuyerProfileView from './pages/Buyer/BuyerProfileView';
import BuyerEditProfile from './pages/Buyer/BuyerEditProfile';
import BuyerNotifications from './pages/Buyer/BuyerNotifications';
import WishlistPage from './pages/Buyer/WishlistPage';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageFarmers from './pages/Admin/ManageFarmers';
import ManageBuyers from './pages/Admin/ManageBuyers';
import ManageProducts from './pages/Admin/ManageProducts';
import ManageOrders from './pages/Admin/ManageOrders';
import ManageCategories from './pages/Admin/ManageCategories';
import ReportsAnalytics from './pages/Admin/ReportsAnalytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Farmer Routes */}
              <Route path="/farmer/dashboard" element={<FarmerRoute><FarmerDashboard /></FarmerRoute>} />
              <Route path="/farmer/profile" element={<FarmerRoute><FarmerProfileView /></FarmerRoute>} />
              <Route path="/farmer/profile/edit" element={<FarmerRoute><FarmerEditProfile /></FarmerRoute>} />
              <Route path="/farmer/products/add" element={<FarmerRoute><AddProduct /></FarmerRoute>} />
              <Route path="/farmer/products" element={<FarmerRoute><MyProducts /></FarmerRoute>} />
              <Route path="/farmer/products/:id/edit" element={<FarmerRoute><EditProduct /></FarmerRoute>} />
              <Route path="/farmer/orders" element={<FarmerRoute><FarmerOrders /></FarmerRoute>} />
              <Route path="/farmer/orders/:id" element={<FarmerRoute><FarmerOrderDetail /></FarmerRoute>} />
              <Route path="/farmer/notifications" element={<FarmerRoute><FarmerNotifications /></FarmerRoute>} />

              {/* Buyer Routes */}
              <Route path="/buyer/dashboard" element={<BuyerRoute><BuyerDashboard /></BuyerRoute>} />
              <Route path="/cart" element={<BuyerRoute><CartPage /></BuyerRoute>} />
              <Route path="/checkout" element={<BuyerRoute><CheckoutPage /></BuyerRoute>} />
              <Route path="/buyer/orders" element={<BuyerRoute><BuyerOrders /></BuyerRoute>} />
              <Route path="/buyer/orders/:id" element={<BuyerRoute><BuyerOrderDetail /></BuyerRoute>} />
              <Route path="/buyer/profile" element={<BuyerRoute><BuyerProfileView /></BuyerRoute>} />
              <Route path="/buyer/profile/edit" element={<BuyerRoute><BuyerEditProfile /></BuyerRoute>} />
              <Route path="/buyer/notifications" element={<BuyerRoute><BuyerNotifications /></BuyerRoute>} />
              <Route path="/buyer/wishlist" element={<BuyerRoute><WishlistPage /></BuyerRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
              <Route path="/admin/farmers" element={<AdminRoute><ManageFarmers /></AdminRoute>} />
              <Route path="/admin/buyers" element={<AdminRoute><ManageBuyers /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
              <Route path="/admin/categories" element={<AdminRoute><ManageCategories /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><ReportsAnalytics /></AdminRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
