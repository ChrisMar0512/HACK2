import React, { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { Crew, FruitFilter, WantedSortOption, WantedStatus } from '../../types/bounty.types';

interface WantedFiltersProps {
  q: string;
  status?: WantedStatus;
  crewId?: string;
  fruit?: FruitFilter;
  sort: WantedSortOption;
  size: 10 | 20 | 50;
  crews: Crew[];
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: {
    status?: WantedStatus;
    crewId?: string;
    fruit?: FruitFilter;
    sort?: WantedSortOption;
    size?: 10 | 20 | 50;
  }) => void;
  onReset: () => void;
}

export const WantedFilters: React.FC<WantedFiltersProps> = ({
  q,
  status,
  crewId,
  fruit,
  sort,
  size,
  crews,
  onSearchChange,
  onFilterChange,
  onReset,
}) => {
  const [localSearch, setLocalSearch] = useState(q);

  useEffect(() => {
    setLocalSearch(q);
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== q) {
        onSearchChange(localSearch);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [localSearch, q, onSearchChange]);

  const hasActiveFilters = Boolean(q || status || crewId || fruit || sort !== 'bounty,desc' || size !== 20);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o epíteto (ej. Akane, Ancla Roja)..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Estado
          </label>
          <select
            value={status || ''}
            onChange={(e) =>
              onFilterChange({
                status: (e.target.value as WantedStatus) || undefined,
              })
            }
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="AT_LARGE">Prófugos</option>
            <option value="CAPTURED">Capturados</option>
            <option value="MISSING">Desaparecidos</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Fruta del Diablo
          </label>
          <select
            value={fruit || ''}
            onChange={(e) =>
              onFilterChange({
                fruit: (e.target.value as FruitFilter) || undefined,
              })
            }
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
          >
            <option value="">Todas las frutas</option>
            <option value="PARAMECIA">Paramecia</option>
            <option value="ZOAN">Zoan</option>
            <option value="LOGIA">Logia</option>
            <option value="NONE">Sin fruta</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tripulación
          </label>
          <select
            value={crewId || ''}
            onChange={(e) =>
              onFilterChange({
                crewId: e.target.value || undefined,
              })
            }
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
          >
            <option value="">Todas las bandas</option>
            {crews.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Ordenar por
          </label>
          <select
            value={sort}
            onChange={(e) =>
              onFilterChange({
                sort: e.target.value as WantedSortOption,
              })
            }
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
          >
            <option value="bounty,desc">Mayor Recompensa</option>
            <option value="name,asc">Nombre (A - Z)</option>
            <option value="updatedAt,desc">Más Recientes</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Por página
          </label>
          <select
            value={size}
            onChange={(e) =>
              onFilterChange({
                size: Number(e.target.value) as 10 | 20 | 50,
              })
            }
            className="w-full rounded-xl bg-slate-950/80 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
          >
            <option value={10}>10 carteles</option>
            <option value={20}>20 carteles</option>
            <option value={50}>50 carteles</option>
          </select>
        </div>
      </div>
    </div>
  );
};
