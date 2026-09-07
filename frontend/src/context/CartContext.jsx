import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { cartApi } from '../services/cartApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isBuyer, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !isBuyer) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      return false;
    }
    if (!isBuyer) {
      toast.error('Only registered buyers can add items to cart.');
      return false;
    }
    try {
      const productId = typeof product === 'string' ? product : product._id;
      const res = await cartApi.addToCart(productId, quantity);
      if (res.data.success) {
        setCart(res.data.cart);
        toast.success(`Added ${product.name || 'item'} to cart!`);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const res = await cartApi.updateCartItem(productId, quantity);
      if (res.data.success) {
        setCart(res.data.cart);
        toast.success('Cart updated');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update item');
      return false;
    }
  };

  const removeCartItem = async (productId) => {
    try {
      const res = await cartApi.removeCartItem(productId);
      if (res.data.success) {
        setCart(res.data.cart);
        toast.success('Item removed from cart');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clearCart();
      if (res.data.success) {
        setCart({ items: [] });
        toast.success('Cart cleared');
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to clear cart');
      return false;
    }
  };

  const cartCount = cart?.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        refreshCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
