import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  User,
  Bell,
  Heart,
  Store,
  Users,
  ShieldCheck,
  FileText,
  Layers,
  BarChart3,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sprout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardSidebar = ({ role = 'farmer', unreadCount = 0 }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const farmerItems = [
    { label: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'My Inventory', path: '/farmer/products', icon: Package },
    { label: 'Add Product', path: '/farmer/products/add', icon: PlusCircle },
    { label: 'Customer Orders', path: '/farmer/orders', icon: ShoppingBag },
    { label: 'Farm Profile', path: '/farmer/profile', icon: User },
    { label: 'Notifications', path: '/farmer/notifications', icon: Bell, badge: unreadCount },
  ];

  const buyerItems = [
    { label: 'Dashboard', path: '/buyer/dashboard', icon: LayoutDashboard },
    { label: 'Marketplace', path: '/marketplace', icon: Store },
    { label: 'Shopping Cart', path: '/cart', icon: ShoppingBag },
    { label: 'My Orders', path: '/buyer/orders', icon: FileText },
    { label: 'Wishlist', path: '/buyer/wishlist', icon: Heart },
    { label: 'My Profile', path: '/buyer/profile', icon: User },
    { label: 'Notifications', path: '/buyer/notifications', icon: Bell, badge: unreadCount },
  ];

  const adminItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Farmer Verification', path: '/admin/farmers', icon: ShieldCheck },
    { label: 'Manage Buyers', path: '/admin/buyers', icon: ShoppingBag },
    { label: 'Product Catalog', path: '/admin/products', icon: Package },
    { label: 'All Orders', path: '/admin/orders', icon: FileText },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const menuItems = role === 'admin' ? adminItems : role === 'buyer' ? buyerItems : farmerItems;

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden p-4 bg-dark-surface border-b border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-primary-400" />
          <span className="font-bold text-slate-100 capitalize">{role} Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-dark-card border border-dark-border text-slate-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-dark-surface border-r border-dark-border z-40 transition-transform duration-300 flex flex-col justify-between p-4 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header Role Title */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-emerald-950/40 border border-emerald-900/50">
            <div className="w-9 h-9 rounded-lg bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 capitalize">{role} Workspace</h3>
              <p className="text-[11px] text-slate-400 truncate">{user?.name || user?.email}</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-slate-950 shadow-md shadow-primary-500/20 font-bold'
                      : 'text-slate-300 hover:bg-dark-hover hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-accent-gold text-slate-950">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && <ChevronRight className="w-4 h-4 text-slate-950" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout Option */}
        <div className="pt-4 border-t border-dark-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
