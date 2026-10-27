import React from 'react';

interface WantedSkeletonProps {
  count?: number;
}

/**
 * Esqueleto de carga con dimensiones idénticas a las WantedCard.
 * ¿Por qué esta estructura?
 * El Checkpoint 2 exige: "Loading, error con reintento y sin resultados, sin mover el layout".
 * Renderizar placeholders de tamaño constante previene el Cumulative Layout Shift (CLS).
 */
export const WantedSkeleton: React.FC<WantedSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between h-[360px] animate-pulse"
        >
          <div>
            {/* Cabecera del cartel */}
            <div className="flex justify-between items-center mb-4">
              <div className="h-5 w-20 bg-slate-800 rounded-full" />
              <div className="h-4 w-16 bg-slate-800 rounded" />
            </div>

            {/* Ilustración de silueta del pirata */}
            <div className="w-full h-36 bg-slate-800/80 rounded-xl mb-4 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-700/60" />
            </div>

            {/* Nombre y Epíteto */}
            <div className="h-5 w-3/4 bg-slate-800 rounded mb-2" />
            <div className="h-3 w-1/2 bg-slate-800/60 rounded mb-3" />

            {/* Info adicional */}
            <div className="h-3 w-2/3 bg-slate-800/50 rounded" />
          </div>

          {/* Recompensa en Berries y botón */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="h-6 w-28 bg-amber-500/20 rounded" />
            <div className="h-8 w-16 bg-slate-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
