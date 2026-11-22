import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const { user } = useAuth(); const [items, setItems] = useState([]); const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => { if (!user) { setItems(JSON.parse(localStorage.getItem('ee_guest_cart') || '[]')); return; } setLoading(true); try { const guest = JSON.parse(localStorage.getItem('ee_guest_cart') || '[]'); if (guest.length) { for (const row of guest) { if (row.product?._id) await api.post('/cart/items', { productId: row.product._id, quantity: row.quantity }).catch(() => {}); } localStorage.removeItem('ee_guest_cart'); } const { data } = await api.get('/cart'); setItems((data.data.cart?.items || []).filter(x => x.product)); } catch {} finally { setLoading(false); } }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const add = useCallback(async (product, quantity = 1) => {
    if (user) { const { data } = await api.post('/cart/items', { productId: product._id, quantity }); setItems(data.data.cart.items.filter(x => x.product)); }
    else { const current = JSON.parse(localStorage.getItem('ee_guest_cart') || '[]'); const found = current.find(x => x.product._id === product._id); if (found) found.quantity += quantity; else current.push({ product, quantity }); localStorage.setItem('ee_guest_cart', JSON.stringify(current)); setItems(current); }
  }, [user]);
  const update = useCallback(async (productId, quantity) => { if (user) { const { data } = await api.patch(`/cart/items/${productId}`, { quantity }); setItems(data.data.cart.items.filter(x => x.product)); } else { const next = items.map(x => ({ ...x, quantity: x.product._id === productId ? quantity : x.quantity })); localStorage.setItem('ee_guest_cart', JSON.stringify(next)); setItems(next); } }, [user, items]);
  const remove = useCallback(async (productId) => { if (user) { const { data } = await api.delete(`/cart/items/${productId}`); setItems(data.data.cart.items.filter(x => x.product)); } else { const next = items.filter(x => x.product._id !== productId); localStorage.setItem('ee_guest_cart', JSON.stringify(next)); setItems(next); } }, [user, items]);
  const clear = useCallback(async () => { if (user) { await Promise.all(items.map(x => api.delete(`/cart/items/${x.product._id}`).catch(() => {}))); } else localStorage.removeItem('ee_guest_cart'); setItems([]); }, [user, items]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0); const subtotal = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);
  const value = useMemo(() => ({ items, loading, add, update, remove, clear, refresh, count, subtotal }), [items, loading, add, update, remove, clear, refresh, count, subtotal]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
