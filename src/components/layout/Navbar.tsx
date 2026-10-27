import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Compass, Skull, LogOut, Anchor, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logPoseService } from '../../services/logpose.service';
import type { LogPose } from '../../types/logpose.types';

export const Navbar: React.FC = () => {
  const { team, logout } = useAuth();
  const navigate = useNavigate();
  const [logPose, setLogPose] = useState<LogPose | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const data = await logPoseService.getStatus();
        if (isMounted) setLogPose(data);
      } catch {
        // Silencioso en navbar si falla la consulta secundaria
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isGrandLineUnlocked = logPose?.grandLineUnlocked || logPose?.status === 'UNLOCKED';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090e17]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
                <Compass className="h-6 w-6 text-amber-400 animate-spin-slow" />
              </div>
              <div>
                <span className="text-base font-black tracking-wider text-amber-400 font-serif block leading-none">
                  LOG POSE
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                  Console Guild
                </span>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center space-x-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Anchor className="h-4 w-4" />
                Dashboard
              </NavLink>

              <NavLink
                to="/wanted"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Skull className="h-4 w-4" />
                Se Busca
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isGrandLineUnlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
              title={logPose?.message || 'Estado de navegación'}
            >
              {isGrandLineUnlocked ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  GRAND LINE
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  EAST BLUE
                </>
              )}
            </div>

            {team && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-200 truncate max-w-[150px]">
                  {team.name}
                </p>
                <p className="text-[11px] font-mono text-amber-400/90 font-semibold">
                  {team.code}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-red-950/40 hover:border-red-800 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desembarcar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
