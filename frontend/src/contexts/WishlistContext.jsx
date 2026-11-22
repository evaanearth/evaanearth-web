import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
const WishlistContext = createContext(null);
export function WishlistProvider({ children }) {
  const { user } = useAuth(); const [ids, setIds] = useState([]);
  const refresh = useCallback(async () => { if (!user) { setIds([]); return; } try { const { data } = await api.get('/wishlist'); setIds((data.data.wishlist.products || []).map(p => p._id)); } catch { setIds([]); } }, [user]);
  useEffect(() => { refresh(); }, [refresh]);
  const has = useCallback(id => ids.includes(id), [ids]);
  const toggle = useCallback(async productId => { if (!user) throw new Error('Sign in to save your wishlist'); const { data } = await api.post(`/wishlist/${productId}`); setIds(current => data.data.added ? [...new Set([...current, productId])] : current.filter(id => id !== productId)); return data.data.added; }, [user]);
  const value = useMemo(() => ({ ids, has, toggle, refresh }), [ids, has, toggle, refresh]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => useContext(WishlistContext);
