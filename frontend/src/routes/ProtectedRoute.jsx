import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-medium">
        Loading session...
      </div>
    );
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

export default ProtectedRoute;
