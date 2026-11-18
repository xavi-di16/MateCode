import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PublicRouteProps {
    children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="screen-center" role="status" aria-live="polite">
                <p>Cargando...</p>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/tasks" replace />;
    }

    return <>{children}</>;
}