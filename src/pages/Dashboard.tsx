import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Users,
  Coins,
  Shield,
  Skull,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { dashboardService } from '../services/dashboard.service';
import { logPoseService } from '../services/logpose.service';
import type { DashboardSummary } from '../types/dashboard.types';
import type { LogPose } from '../types/logpose.types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { formatBerries, StatusBadge, FruitBadge, ThreatLevel } from '../components/common/Badge';
import { getApiErrorMessage } from '../api/apiClient';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [logPose, setLogPose] = useState<LogPose | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const [summaryData, logPoseData] = await Promise.all([
        dashboardService.getSummary(controller.signal),
        logPoseService.getStatus(controller.signal),
      ]);

      setSummary(summaryData);
      setLogPose(logPoseData);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CanceledError') {
        return;
      }
      setError(getApiErrorMessage(err, 'No se pudo cargar la información del Dashboard.'));
    } finally {
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Consultando el rumbo del Log Pose y los registros de la Guild..." size="lg" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="py-12 max-w-2xl mx-auto">
        <ErrorState
          title="Fallo en la comunicación con la Guild"
          message={error || 'No se recibieron datos del servidor.'}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const isGrandLineUnlocked = logPose?.grandLineUnlocked || logPose?.status === 'UNLOCKED';
  const isWorkspaceEmpty = summary.wanted.total === 0;

  return (
    <div className="space-y-8">
      <div
        className={`rounded-2xl border p-6 sm:p-8 backdrop-blur-md transition-all ${
          isGrandLineUnlocked
            ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 shadow-lg shadow-emerald-950/30'
            : 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 shadow-lg shadow-amber-950/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${
                  isGrandLineUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isGrandLineUnlocked ? 'GRAND LINE DESBLOQUEADO' : 'TRAMO: EAST BLUE'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Tripulación {summary.team.name} ({summary.team.code})
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif">
              {isGrandLineUnlocked ? 'Rumbo Libre hacia el Grand Line' : 'Inspección del Log Pose en Reverse Mountain'}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {logPose?.message || 'Consulta el estado de tu Log Pose y prepara tu defensa en Reverse Mountain.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <a
              href="https://logpose-api-jg7f.onrender.com/reverse-mountain"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              <Compass className="h-4 w-4" />
              <span>Cola de Inspección (CP3)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={loadDashboardData}
              title="Actualizar datos"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sm:hidden">Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {isWorkspaceEmpty ? (
        <EmptyState
          title="Tu Workspace está libre de piratas"
          message="Aún no se han registrado carteles de Se Busca para tu tripulación. Puedes explorar la lista para comprobar los filtros y parámetros del servidor."
          actionText="Explorar Carteles de Se Busca"
          onAction={() => window.location.assign('/wanted')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Carteles Totales</span>
                <Skull className="h-5 w-5 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white font-mono">
                {summary.wanted.total}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Registrados en el workspace
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Bounty Acumulado</span>
                <Coins className="h-5 w-5 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-300 font-mono truncate">
                {formatBerries(summary.wanted.totalBounty)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Total acumulado en berries
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Recompensa Media</span>
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono truncate">
                {formatBerries(summary.wanted.averageBounty)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Promedio por criminal
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Tripulaciones</span>
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white font-mono">
                {summary.crews.total}
              </p>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {summary.crews.mostWanted
                  ? `Líder: ${summary.crews.mostWanted.name}`
                  : 'Sin bandas rivales'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                Estado de los Carteles
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-center">
                  <span className="text-xs text-red-300 font-bold block mb-1">PRÓFUGOS</span>
                  <span className="text-2xl font-black text-red-400 font-mono">
                    {summary.wanted.byStatus.AT_LARGE}
                  </span>
                </div>
                <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-center">
                  <span className="text-xs text-emerald-300 font-bold block mb-1">CAPTURADOS</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {summary.wanted.byStatus.CAPTURED}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-center">
                  <span className="text-xs text-slate-300 font-bold block mb-1">DESAPARECIDOS</span>
                  <span className="text-2xl font-black text-slate-400 font-mono">
                    {summary.wanted.byStatus.MISSING}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Frutas del Diablo
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-2.5 text-center">
                  <span className="text-[11px] text-purple-300 font-semibold block mb-1">Paramecia</span>
                  <span className="text-xl font-black text-purple-400 font-mono">
                    {summary.wanted.byFruit.PARAMECIA}
                  </span>
                </div>
                <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-2.5 text-center">
                  <span className="text-[11px] text-amber-300 font-semibold block mb-1">Zoan</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {summary.wanted.byFruit.ZOAN}
                  </span>
                </div>
                <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-2.5 text-center">
                  <span className="text-[11px] text-cyan-300 font-semibold block mb-1">Logia</span>
                  <span className="text-xl font-black text-cyan-400 font-mono">
                    {summary.wanted.byFruit.LOGIA}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-2.5 text-center">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1">Sin Fruta</span>
                  <span className="text-xl font-black text-slate-300 font-mono">
                    {summary.wanted.byFruit.NONE}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white font-serif tracking-wide">
                  Top 5 Criminales Más Buscados
                </h3>
                <p className="text-xs text-slate-400">
                  Los carteles con las recompensas más altas del East Blue
                </p>
              </div>
              <Link
                to="/wanted"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
              >
                <span>Ver todos los carteles</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            <div className="divide-y divide-slate-800">
              {summary.topBounties.map((pirate, idx) => (
                <div
                  key={pirate.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-mono font-black text-sm border border-amber-500/20">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/wanted/${pirate.id}`}
                          className="font-bold text-white hover:text-amber-300 transition-colors"
                        >
                          {pirate.name}
                        </Link>
                        {pirate.epithet && (
                          <span className="text-xs text-amber-400/90 font-serif italic">
                            "{pirate.epithet}"
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{pirate.crew.name}</span>
                        <span>•</span>
                        <span>{pirate.role}</span>
                        <span>•</span>
                        <FruitBadge fruitType={pirate.devilFruit?.type || null} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <p className="font-mono font-black text-amber-400 text-base">
                        {formatBerries(pirate.bounty)}
                      </p>
                      <ThreatLevel level={pirate.threatLevel} />
                    </div>
                    <StatusBadge status={pirate.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
