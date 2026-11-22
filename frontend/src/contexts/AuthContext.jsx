import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken } from '@/lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  const accept = useCallback((data) => { setUser(data.user); setAccessToken(data.accessToken); }, []);
  useEffect(() => { let active = true; api.post('/auth/refresh', {}).then(({ data }) => { if (active) accept(data.data); }).catch(() => { setAccessToken(''); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [accept]);
  const login = useCallback(async (payload) => { const { data } = await api.post('/auth/login', payload); accept(data.data); return data.data.user; }, [accept]);
  const register = useCallback(async (payload) => { const { data } = await api.post('/auth/register', payload); accept(data.data); return data.data.user; }, [accept]);
  const logout = useCallback(async () => { try { await api.post('/auth/logout'); } catch {} setUser(null); setAccessToken(''); }, []);
  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
