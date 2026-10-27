import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Skull,
  Calendar,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { bountyService } from '../services/bounty.service';
import type { WantedDetail as IWantedDetail } from '../types/bounty.types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge, FruitBadge, ThreatLevel, formatBerries } from '../components/common/Badge';
import { getApiErrorMessage } from '../api/apiClient';

export const WantedDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [detail, setDetail] = useState<IWantedDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const backSearchParams = (location.state as { fromWantedSearch?: string })?.fromWantedSearch || '';
  const backUrl = `/wanted${backSearchParams}`;

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    let isMounted = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await bountyService.getWantedById(id, controller.signal);
        if (isMounted) setDetail(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'CanceledError') return;
        if (isMounted) {
          setError(getApiErrorMessage(err, 'No se pudo cargar el expediente del cartel.'));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Abriendo el expediente clasificado de la Marina..." size="lg" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="py-12 max-w-xl mx-auto space-y-6">
        <ErrorState
          title="Cartel no encontrado en este sector"
          message={error || 'El identificador del cartel no existe en el workspace del equipo.'}
        />
        <div className="text-center">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a los carteles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      <div>
        <button
          type="button"
          onClick={() => navigate(backUrl)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Volver al listado de carteles</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-1">
          <div className="wanted-paper rounded-2xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="font-serif text-3xl font-black tracking-[0.25em] text-[#3d2314] border-b-2 border-[#3d2314] pb-2">
              WANTED
            </div>

            <div className="w-full aspect-square bg-[#3d2314]/15 rounded-xl border-2 border-[#3d2314]/30 flex flex-col items-center justify-center p-4">
              <Skull className="w-20 h-20 text-[#3d2314] opacity-80" />
              <span className="font-mono text-xs text-[#3d2314]/80 font-bold mt-2">
                {detail.crew.name}
              </span>
            </div>

            <div className="font-serif text-sm font-black tracking-[0.2em] text-[#8b0000]">
              DEAD OR ALIVE
            </div>

            <div>
              <h2 className="font-serif font-black text-xl text-[#261608] uppercase tracking-wide">
                {detail.name}
              </h2>
              {detail.epithet && (
                <p className="font-serif italic text-xs text-[#5a3d28]">
                  "{detail.epithet}"
                </p>
              )}
            </div>

            <div className="pt-2 border-t-2 border-[#3d2314]">
              <div className="font-mono font-black text-2xl text-[#8b0000] tracking-tight">
                {formatBerries(detail.bounty)}
              </div>
              <div className="text-[10px] font-serif uppercase tracking-widest text-[#5a3d28] font-bold mt-0.5">
                MARINE HEADQUARTERS
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={detail.status} />
                <FruitBadge fruitType={detail.devilFruit?.type || null} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Amenaza:</span>
                <ThreatLevel level={detail.threatLevel} />
              </div>
            </div>

            <h1 className="text-3xl font-black text-white font-serif">
              {detail.name}
            </h1>
            <p className="text-sm font-serif italic text-amber-400 mt-1">
              {detail.epithet ? `"${detail.epithet}"` : 'Sin epíteto oficial'}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Tripulación:</span>
                <span className="font-bold text-white">{detail.crew.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Rol a bordo:</span>
                <span className="font-bold text-white">{detail.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Fruta del Diablo:</span>
                <span className="font-bold text-white">
                  {detail.devilFruit ? detail.devilFruit.name : 'Ninguna'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Edad:</span>
                <span className="font-bold text-white">{detail.age} años</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Estatura:</span>
                <span className="font-bold text-white">{detail.heightCm} cm</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Última isla:</span>
                <span className="font-bold text-amber-300">{detail.lastSeen.island}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Informe de Inteligencia Marina
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {detail.bio}
            </p>
            <div className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Avistado el: {new Date(detail.lastSeen.seenAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Evolución de la Recompensa (Bounty History)
            </h3>
            <div className="space-y-3">
              {detail.bountyHistory.map((item, index) => {
                const isCurrent = index === detail.bountyHistory.length - 1;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isCurrent
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Edición #{index + 1}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.issuedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isCurrent ? 'text-amber-400 font-black' : 'text-slate-300'
                        }`}
                      >
                        {formatBerries(item.amount)}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 uppercase">
                          Actual
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
