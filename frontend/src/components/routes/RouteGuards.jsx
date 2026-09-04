import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

export const PublicRoute = ({ children }) => {
  return children;
};

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-medium">Loading session...</div>;
  }
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Authentication Required</h3>
          <p className="text-xs text-slate-400">Please sign in to access this protected area of FarmConnect.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-primary-500/20"
          >
            <LogIn className="w-4 h-4" /> Sign In Now
          </Link>
        </div>
      </div>
    );
  }
  return children;
};

export const FarmerRoute = ({ children }) => {
  const { user, loading, isFarmer } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-medium">Loading session...</div>;
  if (!user || !isFarmer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Farmer Access Required</h3>
          <p className="text-xs text-slate-400">You must be logged in as a registered Farmer to view this dashboard.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-primary-500/20"
          >
            <LogIn className="w-4 h-4" /> Sign In as Farmer
          </Link>
        </div>
      </div>
    );
  }
  return children;
};

export const BuyerRoute = ({ children }) => {
  const { user, loading, isBuyer } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-medium">Loading session...</div>;
  if (!user || !isBuyer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Buyer Access Required</h3>
          <p className="text-xs text-slate-400">You must be logged in as a registered Buyer to access shopping features.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-primary-500/20"
          >
            <LogIn className="w-4 h-4" /> Sign In as Buyer
          </Link>
        </div>
      </div>
    );
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-medium">Loading session...</div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-dark-card border border-amber-500/40 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Admin Authorization Required</h3>
          <p className="text-xs text-slate-400">This control panel is strictly restricted to platform administrators.</p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            <LogIn className="w-4 h-4" /> Admin Login
          </Link>
        </div>
      </div>
    );
  }
  return children;
};
