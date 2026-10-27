import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Sin carteles en el horizonte',
  message = 'No se encontraron registros con los filtros o coordenadas seleccionadas.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center backdrop-blur-sm ${className}`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/60 text-amber-400 mb-4 ring-1 ring-amber-500/20">
        <Compass className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-200 tracking-wide">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">{message}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
