import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getDeliveryFee: () => number;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const STANDARD_DELIVERY_FEE = 120;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cartplus-cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const { success, info } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('cartplus-cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    if (quantity <= 0) return;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + quantity, product.stock);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        success(`Updated quantity for "${product.name}" in cart.`);
        return updated;
      } else {
        const initialQty = Math.min(quantity, product.stock);
        success(`Added "${product.name}" to cart.`);
        return [...prev, { product, quantity: initialQty }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (item) {
      info(`Removed "${item.product.name}" from cart.`);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock;
          const validQty = Math.min(quantity, maxStock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const increaseQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  const decreaseQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      removeFromCart(productId);
    }
  };

  const clearCart = () => {
    setCart([]);
    info('Cart has been cleared.');
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getCartDiscount = () => {
    return cart.reduce((sum, item) => {
      const original = item.product.original_price || item.product.price;
      const saving = Math.max(0, original - item.product.price);
      return sum + saving * item.quantity;
    }, 0);
  };

  const getDeliveryFee = () => {
    const subtotal = getCartSubtotal();
    if (subtotal === 0) return 0;
    return STANDARD_DELIVERY_FEE;
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    if (subtotal === 0) return 0;
    return subtotal + getDeliveryFee();
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId: string) => {
    return cart.some((item) => item.product.id === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        getCartSubtotal,
        getCartDiscount,
        getDeliveryFee,
        getCartTotal,
        getCartCount,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
