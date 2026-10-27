import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Turbulencia en alta mar',
  message = 'No se pudo conectar con el servidor o los datos no respondieron a tiempo.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl border border-red-900/60 bg-red-950/30 p-6 text-center backdrop-blur-sm ${className}`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-900/40 text-red-400 mb-4 ring-1 ring-red-500/30">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-red-200 tracking-wide">{title}</h3>
      <p className="mt-2 text-sm text-red-300/80 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Reintentar rumbo
          </button>
        </div>
      )}
    </div>
  );
};
