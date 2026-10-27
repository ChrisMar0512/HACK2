import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

/**
 * Componente Guardián de Rutas Privadas.
 * 
 * ¿Por qué esta estructura?
 * 1. isInitializing previene el parpadeo del formulario de login mientras se valida
 *    el token existente en localStorage contra GET /auth/me.
 * 2. Guarda la ubicación intentada en `location.state.from` para que tras el login
 *    el usuario sea redirigido exactamente a la pantalla que solicitó originalmente.
 */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#070d17] flex items-center justify-center">
        <LoadingSpinner message="Comprobando credenciales de la tripulación..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirige al login preservando la ruta previa en el estado de navegación
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
