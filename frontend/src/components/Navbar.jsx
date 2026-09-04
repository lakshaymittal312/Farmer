import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, ShoppingBag, Bell, User, LogOut, Menu, X, Shield, ChevronDown } from 'lucide-react';
import api from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, isFarmer, isBuyer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [userDropdown, setUserDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadNotifications();
      if (isBuyer) fetchCartCount();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // silent
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart?.items) {
        const count = res.data.cart.items.reduce((acc, i) => acc + i.quantity, 0);
        setCartCount(count);
      }
    } catch (err) {
      // silent
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/login');
  };

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      location.pathname === path
        ? 'text-primary-400 bg-emerald-950/60 border border-primary-500/30'
        : 'text-slate-300 hover:text-slate-100 hover:bg-dark-hover'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-dark-border shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-primary-300 to-emerald-400">
                  FarmConnect
                </span>
                <span className="text-[9px] tracking-widest text-emerald-500 font-semibold uppercase -mt-1">
                  Direct Farm Market
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/" className={navLinkClass('/')}>
                Home
              </Link>
              <Link to="/marketplace" className={navLinkClass('/marketplace')}>
                Marketplace
              </Link>
              <Link to="/about" className={navLinkClass('/about')}>
                About
              </Link>
              <Link to="/contact" className={navLinkClass('/contact')}>
                Contact
              </Link>
            </div>
          </div>

          {/* Right Action Icons & User Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Role Specific Quick Dashboard Button */}
                {isFarmer && (
                  <Link
                    to="/farmer/dashboard"
                    className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-primary-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Sprout className="w-3.5 h-3.5 text-primary-400" />
                    Farmer Dashboard
                  </Link>
                )}

                {isBuyer && (
                  <>
                    <Link
                      to="/cart"
                      className="relative p-2 rounded-xl bg-dark-card border border-dark-border text-slate-300 hover:text-slate-100 hover:border-primary-500/40 transition"
                      title="Shopping Cart"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-gold text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                          {cartCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/buyer/dashboard"
                      className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-primary-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                    >
                      Buyer Portal
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Admin Panel
                  </Link>
                )}

                {/* Notification Bell */}
                <Link
                  to={
                    isFarmer
                      ? '/farmer/notifications'
                      : isBuyer
                      ? '/buyer/notifications'
                      : '/admin/dashboard'
                  }
                  className="relative p-2 rounded-xl bg-dark-card border border-dark-border text-slate-300 hover:text-slate-100 hover:border-primary-500/40 transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-md">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdown(!userDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border hover:border-primary-500/50 transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 mt-2 w-52 bg-dark-surface border border-dark-border rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                      <div className="px-3 py-2 border-b border-dark-border mb-1">
                        <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-primary-300 border border-primary-800/60 uppercase font-semibold">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to={isFarmer ? '/farmer/profile' : isBuyer ? '/buyer/profile' : '/admin/dashboard'}
                        onClick={() => setUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-dark-hover hover:text-slate-100"
                      >
                        <User className="w-4 h-4 text-primary-400" />
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-slate-100 px-3 py-2 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-primary-500/20 transition"
                >
                  Join FarmConnect
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="p-2 rounded-xl bg-dark-card border border-dark-border text-slate-300"
            >
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-dark-surface border-b border-dark-border p-4 space-y-3 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenu(false)}
            className="block text-slate-200 py-2 font-medium"
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenu(false)}
            className="block text-slate-200 py-2 font-medium"
          >
            Marketplace
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenu(false)}
            className="block text-slate-200 py-2 font-medium"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenu(false)}
            className="block text-slate-200 py-2 font-medium"
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-dark-border space-y-2">
              <p className="text-xs text-slate-400">Signed in as {user.name} ({user.role})</p>
              {isFarmer && (
                <Link
                  to="/farmer/dashboard"
                  onClick={() => setMobileMenu(false)}
                  className="block bg-emerald-950 text-primary-300 py-2 px-3 rounded-xl font-semibold text-sm"
                >
                  Farmer Dashboard
                </Link>
              )}
              {isBuyer && (
                <Link
                  to="/buyer/dashboard"
                  onClick={() => setMobileMenu(false)}
                  className="block bg-emerald-950 text-primary-300 py-2 px-3 rounded-xl font-semibold text-sm"
                >
                  Buyer Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenu(false)}
                  className="block bg-amber-950 text-amber-300 py-2 px-3 rounded-xl font-semibold text-sm"
                >
                  Admin Control Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left text-rose-400 py-2 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-dark-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenu(false)}
                className="block text-center py-2 bg-dark-card border border-dark-border rounded-xl font-semibold text-sm text-slate-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenu(false)}
                className="block text-center py-2 bg-primary-500 text-slate-950 rounded-xl font-bold text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
