import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, token } = useAuth();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aurora_guest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derive cart totals locally or from server response
  const subtotal = Number(
    items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0).toFixed(2)
  );

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Sync with backend if authenticated
  const fetchServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await api.get('/cart');
      setItems(data.items || []);
    } catch (err) {
      console.warn('Failed to fetch server cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    } else {
      localStorage.setItem('aurora_guest_cart', JSON.stringify(items));
    }
  }, [isAuthenticated, token, fetchServerCart]);

  // Keep guest cart in localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('aurora_guest_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  /**
   * Add to cart
   */
  const addToCart = async (product, quantity = 1) => {
    const qty = Number(quantity) || 1;

    if (isAuthenticated) {
      try {
        const data = await api.post('/cart/items', { productId: product.id, quantity: qty });
        setItems(data.items || []);
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    } else {
      // Local guest cart handling
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((i) => i.productId === product.id);
        if (existingIndex > -1) {
          const updated = [...prevItems];
          const newQty = updated[existingIndex].quantity + qty;
          if (newQty > product.stock_quantity) {
            throw new Error(`Cannot add more. Only ${product.stock_quantity} available in stock.`);
          }
          updated[existingIndex].quantity = newQty;
          updated[existingIndex].lineTotal = Number((newQty * updated[existingIndex].unitPrice).toFixed(2));
          return updated;
        } else {
          if (qty > product.stock_quantity) {
            throw new Error(`Requested quantity exceeds available stock (${product.stock_quantity}).`);
          }
          return [
            ...prevItems,
            {
              productId: product.id,
              name: product.name,
              unitPrice: Number(product.price),
              quantity: qty,
              lineTotal: Number((qty * Number(product.price)).toFixed(2)),
              availableStock: product.stock_quantity,
              imageUrl: product.image_url,
              category: product.category,
            },
          ];
        }
      });
    }
  };

  /**
   * Update quantity
   */
  const updateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);

    if (isAuthenticated) {
      try {
        const data = await api.patch(`/cart/items/${productId}`, { quantity: qty });
        if (data.cart) {
          setItems(data.cart.items || []);
        } else {
          setItems(data.items || []);
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    } else {
      if (qty <= 0) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity: qty,
                  lineTotal: Number((qty * i.unitPrice).toFixed(2)),
                }
              : i
          )
        );
      }
    }
  };

  /**
   * Remove line item
   */
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const data = await api.delete(`/cart/items/${productId}`);
        setItems(data.cart?.items || []);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    } else {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    }
  };

  /**
   * Clear all items
   */
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.warn('Clear server cart error:', err.message);
      }
    }
    setItems([]);
    localStorage.removeItem('aurora_guest_cart');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        itemCount,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
