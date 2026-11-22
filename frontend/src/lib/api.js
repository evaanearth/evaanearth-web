import axios from 'axios';
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL = (configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1')).replace(/\/+$/, '');
export const api = axios.create({ baseURL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
let accessToken = localStorage.getItem('ee_access_token') || '';
let refreshPromise = null;
export function setAccessToken(token) { accessToken = token || ''; if (token) localStorage.setItem('ee_access_token', token); else localStorage.removeItem('ee_access_token'); }
api.interceptors.request.use((config) => { if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`; return config; });
api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original?._retry && !original?.url?.includes('/auth/')) {
    original._retry = true;
    try {
      refreshPromise ||= axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true }).then(({ data }) => { setAccessToken(data.data.accessToken); return data.data.accessToken; }).finally(() => { refreshPromise = null; });
      const token = await refreshPromise; original.headers.Authorization = `Bearer ${token}`; return api(original);
    } catch { setAccessToken(''); }
  }
  return Promise.reject(error);
});
export const unwrap = (promise) => promise.then(r => r.data.data);
