import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export default function ProtectedRoute({ roles }) { const { user, loading } = useAuth(); if (loading) return <div className="page-center"><div className="loader"/></div>; if (!user) return <Navigate to="/auth" replace />; if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />; return <Outlet />; }
