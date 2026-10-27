import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Compass, Anchor, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { ApiErrorResponse } from '../types/api.types';

export const Login: React.FC = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    teamName?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const fromLocation = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const destination = fromLocation ? `${fromLocation.pathname}${fromLocation.search || ''}` : '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({
          teamName: teamName.trim(),
          email: email.trim(),
          password,
        });
      }
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as ApiErrorResponse | undefined;

        if (errorData) {
          const newErrors: typeof fieldErrors = {};

          if (errorData.code === 'VALIDATION_ERROR' && errorData.details) {
            errorData.details.forEach((item) => {
              if (item.field === 'email') newErrors.email = item.message;
              else if (item.field === 'password') newErrors.password = item.message;
              else if (item.field === 'teamName') newErrors.teamName = item.message;
              else newErrors.general = item.message;
            });
          } else if (errorData.code === 'EMAIL_ALREADY_REGISTERED') {
            newErrors.email = errorData.message || 'Este correo electrónico ya está registrado.';
          } else if (errorData.code === 'TEAM_NAME_TAKEN') {
            newErrors.teamName = errorData.message || 'El nombre de tripulación ya ha sido tomado.';
          } else if (errorData.code === 'INVALID_CREDENTIALS') {
            newErrors.general = 'Credenciales incorrectas. Verifica tu email y contraseña.';
          } else if (errorData.code === 'REGISTRATION_CLOSED') {
            newErrors.general = 'El registro de tripulaciones ha sido cerrado por la organización.';
          } else {
            newErrors.general = errorData.message || 'Ocurrió un error en la solicitud.';
          }

          setFieldErrors(newErrors);
        } else {
          setFieldErrors({ general: 'Error de conexión con el servidor.' });
        }
      } else {
        setFieldErrors({ general: 'Ocurrió un error inesperado al procesar la solicitud.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d17] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
            <Compass className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-serif">
            LOG POSE CONSOLE
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Guild de Cazarrecompensas · Rumbo al Grand Line
          </p>
        </div>

        <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setFieldErrors({});
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setFieldErrors({});
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Registrar Tripulación
            </button>
          </div>

          {fieldErrors.general && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{fieldErrors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre de la Tripulación
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sabuesos de la Marea"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className={`w-full rounded-xl bg-slate-900/90 border px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                      fieldErrors.teamName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'
                    }`}
                  />
                  <Anchor className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                </div>
                {fieldErrors.teamName && (
                  <p className="mt-1 text-xs text-red-400 font-medium">
                    {fieldErrors.teamName}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                placeholder="tripulacion@grandline.test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-xl bg-slate-900/90 border px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                  fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-xl bg-slate-900/90 border px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                  fieldErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-700'
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {fieldErrors.password}
                </p>
              )}
              {mode === 'register' && !fieldErrors.password && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Mínimo 8 caracteres (máximo 72).
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Compass className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Navegando...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Zarpar hacia la Consola</span>
                </>
              ) : (
                <>
                  <Anchor className="w-4 h-4" />
                  <span>Registrar Tripulación y Zarpar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
            <span className="font-semibold text-amber-400/90">Importante: </span>
            Una sola cuenta por equipo. Los tres integrantes comparten el mismo email y contraseña.
          </div>
        </div>
      </div>
    </div>
  );
};
