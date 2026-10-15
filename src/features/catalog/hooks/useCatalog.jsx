import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listPublicProducts, getCachedPublicCatalog } from '../api/catalog.api';

export const CATALOG_QUERY_KEYS = {
  all: ['catalog'],
  list: (params) => ['catalog', 'list', params],
};

/**
 * Hook to fetch public products across stores
 */
export function usePublicProducts(params = {}) {
  const isDefaultView = !params?.search && (!params?.storeCode || params?.storeCode === 'all') && !params?.categorySlug;
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.list(params),
    queryFn: () => listPublicProducts(params),
    placeholderData: () => (isDefaultView ? getCachedPublicCatalog() || undefined : undefined),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

const CartContext = createContext(null);

const STORAGE_KEY = 'star_enterprises_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage quota or private browsing
    }
  }, [items]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.selling_price * item.quantity,
    0
  );

  const value = {
    items,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
