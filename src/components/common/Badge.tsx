import React from 'react';
import type { FruitType, WantedStatus } from '../../types/bounty.types';

export { formatBerries } from '../../utils/formatters';

export const StatusBadge: React.FC<{ status: WantedStatus }> = ({ status }) => {
  const configs: Record<WantedStatus, { label: string; className: string }> = {
    AT_LARGE: {
      label: 'PRÓFUGO',
      className: 'bg-red-500/15 text-red-400 border-red-500/30',
    },
    CAPTURED: {
      label: 'CAPTURADO',
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    MISSING: {
      label: 'DESAPARECIDO',
      className: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    },
  };

  const config = configs[status] || configs.AT_LARGE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export const FruitBadge: React.FC<{ fruitType: FruitType | 'NONE' | null }> = ({ fruitType }) => {
  if (!fruitType || fruitType === 'NONE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        Sin Fruta
      </span>
    );
  }

  const configs: Record<FruitType, { label: string; className: string }> = {
    PARAMECIA: {
      label: 'Paramecia',
      className: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
    ZOAN: {
      label: 'Zoan',
      className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    LOGIA: {
      label: 'Logia',
      className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    },
  };

  const config = configs[fruitType];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export const ThreatLevel: React.FC<{ level: number }> = ({ level }) => {
  return (
    <div className="flex items-center gap-1" title={`Nivel de Amenaza: ${level}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xs ${star <= level ? 'text-amber-400 font-bold' : 'text-slate-700'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};
