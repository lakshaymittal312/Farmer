import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const PublicRoute = ({ children }) => {
  return children;
};

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-red-600">Access Denied. Please Login.</div>;
  return children;
};

export const FarmerRoute = ({ children }) => {
  const { user, loading, isFarmer } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !isFarmer) {
    return <div className="p-8 text-center text-red-600">Access Denied. Farmer role required.</div>;
  }
  return children;
};

export const BuyerRoute = ({ children }) => {
  const { user, loading, isBuyer } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !isBuyer) {
    return <div className="p-8 text-center text-red-600">Access Denied. Buyer role required.</div>;
  }
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !isAdmin) {
    return <div className="p-8 text-center text-red-600">Access Denied. Admin role required.</div>;
  }
  return children;
};
