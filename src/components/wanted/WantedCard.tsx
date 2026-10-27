import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Skull, MapPin, Eye } from 'lucide-react';
import type { WantedSummary } from '../../types/bounty.types';
import { StatusBadge, FruitBadge, ThreatLevel, formatBerries } from '../common/Badge';

interface WantedCardProps {
  pirate: WantedSummary;
}

export const WantedCard: React.FC<WantedCardProps> = ({ pirate }) => {
  const location = useLocation();

  return (
    <div className="group relative rounded-2xl border border-slate-800 bg-[#0f172a]/80 hover:border-amber-500/50 p-5 flex flex-col justify-between h-[380px] backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
      
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <StatusBadge status={pirate.status} />
          <ThreatLevel level={pirate.threatLevel} />
        </div>

        <div className="relative w-full h-36 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/60 flex flex-col items-center justify-center p-3 text-center overflow-hidden mb-4 group-hover:border-amber-500/40 transition-colors">
          <div className="absolute top-1.5 font-serif text-[10px] tracking-[0.25em] text-amber-400/80 font-black">
            DEAD OR ALIVE
          </div>
          <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 my-auto shadow-inner">
            <Skull className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-mono text-[11px] text-slate-400 truncate max-w-full">
            {pirate.crew.name}
          </div>
        </div>

        <div className="space-y-0.5">
          <h3 className="font-bold text-base text-white truncate group-hover:text-amber-300 transition-colors">
            {pirate.name}
          </h3>
          <p className="text-xs font-serif italic text-amber-400/90 truncate">
            {pirate.epithet ? `"${pirate.epithet}"` : 'Sin epíteto registrado'}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <FruitBadge fruitType={pirate.devilFruit?.type || null} />
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[140px]" title={pirate.lastSeenIsland}>
            <MapPin className="w-3 h-3 text-amber-400/70 shrink-0" />
            <span className="truncate">{pirate.lastSeenIsland}</span>
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
            Recompensa
          </span>
          <span className="font-mono font-black text-amber-300 text-sm tracking-tight">
            {formatBerries(pirate.bounty)}
          </span>
        </div>

        <Link
          to={`/wanted/${pirate.id}`}
          state={{ fromWantedSearch: location.search }}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 px-3 py-1.5 text-xs font-bold text-amber-300 hover:text-slate-950 border border-amber-500/30 transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver</span>
        </Link>
      </div>
    </div>
  );
};
