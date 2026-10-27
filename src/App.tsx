import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Wanted } from './pages/Wanted';
import { WantedDetail } from './pages/WantedDetail';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas privadas bajo MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wanted" element={<Wanted />} />
              <Route path="/wanted/:id" element={<WantedDetail />} />
            </Route>
          </Route>

          {/* Ruta 404 para cualquier otra ruta no reconocida */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
