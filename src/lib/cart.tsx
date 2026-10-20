import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { MenuItem } from '@/lib/menu';

export type CartLine = {
  key: string;
  item: MenuItem;
  merchantId: string;
  merchantName: string;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  merchantId: string | null;
  merchantName: string | null;
};

type CartContextValue = {
  lines: CartLine[];
  merchantId: string | null;
  merchantName: string | null;
  count: number;
  subtotal: number;
  addItem: (item: MenuItem, merchantId: string, merchantName: string) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = 'nexu_cart';

const CartContext = createContext<CartContextValue | null>(null);

function loadState(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartState;
  } catch { /* ignore */ }
  return { items: [], merchantId: null, merchantName: null };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(loadState);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const addItem = useCallback((item: MenuItem, merchantId: string, merchantName: string) => {
    setState(prev => {
      if (prev.merchantId && prev.merchantId !== merchantId) {
        return {
          merchantId,
          merchantName,
          items: [{ key: item.id, item, merchantId, merchantName, quantity: 1 }],
        };
      }
      const existing = prev.items.find(l => l.key === item.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(l => l.key === item.id ? { ...l, quantity: l.quantity + 1 } : l),
        };
      }
      return {
        merchantId: prev.merchantId ?? merchantId,
        merchantName: prev.merchantName ?? merchantName,
        items: [...prev.items, { key: item.id, item, merchantId, merchantName, quantity: 1 }],
      };
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setState(prev => {
      const items = prev.items.filter(l => l.key !== key);
      return {
        items,
        merchantId: items.length > 0 ? prev.merchantId : null,
        merchantName: items.length > 0 ? prev.merchantName : null,
      };
    });
  }, []);

  const setQuantity = useCallback((key: string, qty: number) => {
    setState(prev => {
      if (qty <= 0) {
        const items = prev.items.filter(l => l.key !== key);
        return {
          items,
          merchantId: items.length > 0 ? prev.merchantId : null,
          merchantName: items.length > 0 ? prev.merchantName : null,
        };
      }
      return {
        ...prev,
        items: prev.items.map(l => l.key === key ? { ...l, quantity: qty } : l),
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setState({ items: [], merchantId: null, merchantName: null });
  }, []);

  const count = state.items.reduce((s, l) => s + l.quantity, 0);
  const subtotal = state.items.reduce((s, l) => s + l.quantity * Number(l.item.price), 0);

  return (
    <CartContext.Provider value={{
      lines: state.items,
      merchantId: state.merchantId,
      merchantName: state.merchantName,
      count,
      subtotal,
      addItem,
      removeLine,
      setQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
