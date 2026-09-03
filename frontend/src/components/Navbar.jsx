import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isFarmer, isBuyer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-emerald-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold tracking-wide flex items-center gap-2">
              🌾 FarmConnect
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="hover:text-emerald-200 px-2 py-1 rounded">Home</Link>
              <Link to="/marketplace" className="hover:text-emerald-200 px-2 py-1 rounded">Marketplace</Link>
              <Link to="/about" className="hover:text-emerald-200 px-2 py-1 rounded">About</Link>
              <Link to="/contact" className="hover:text-emerald-200 px-2 py-1 rounded">Contact</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isFarmer && (
                  <>
                    <Link to="/farmer/dashboard" className="bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded text-sm font-medium">Farmer Dashboard</Link>
                    <Link to="/farmer/products" className="hover:text-emerald-200 text-sm">My Products</Link>
                    <Link to="/farmer/orders" className="hover:text-emerald-200 text-sm">Orders</Link>
                    <Link to="/farmer/notifications" className="hover:text-emerald-200 text-sm">Notifications</Link>
                  </>
                )}

                {isBuyer && (
                  <>
                    <Link to="/buyer/dashboard" className="bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded text-sm font-medium">Buyer Dashboard</Link>
                    <Link to="/cart" className="hover:text-emerald-200 text-sm">Cart</Link>
                    <Link to="/buyer/orders" className="hover:text-emerald-200 text-sm">My Orders</Link>
                    <Link to="/buyer/wishlist" className="hover:text-emerald-200 text-sm">Wishlist</Link>
                    <Link to="/buyer/notifications" className="hover:text-emerald-200 text-sm">Notifications</Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" className="bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded text-sm font-medium">Admin Dashboard</Link>
                    <Link to="/admin/users" className="hover:text-emerald-200 text-sm">Users</Link>
                    <Link to="/admin/categories" className="hover:text-emerald-200 text-sm">Categories</Link>
                  </>
                )}

                <div className="flex items-center space-x-2 pl-4 border-l border-emerald-600">
                  <span className="text-sm font-medium">{user.name} ({user.role})</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="hover:text-emerald-200 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-1.5 rounded font-medium">Register</Link>
                <Link to="/admin/login" className="text-xs text-emerald-200 hover:text-white underline">Admin Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
