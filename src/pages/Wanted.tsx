import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skull, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { bountyService } from '../services/bounty.service';
import type {
  Crew,
  FruitFilter,
  WantedPage,
  WantedQueryParams,
  WantedSortOption,
  WantedStatus,
} from '../types/bounty.types';
import { WantedFilters } from '../components/wanted/WantedFilters';
import { WantedCard } from '../components/wanted/WantedCard';
import { WantedSkeleton } from '../components/wanted/WantedSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { getApiErrorMessage } from '../api/apiClient';

const VALID_SIZES = [10, 20, 50] as const;
const VALID_STATUSES: WantedStatus[] = ['AT_LARGE', 'CAPTURED', 'MISSING'];
const VALID_FRUITS: FruitFilter[] = ['PARAMECIA', 'ZOAN', 'LOGIA', 'NONE'];
const VALID_SORTS: WantedSortOption[] = ['bounty,desc', 'name,asc', 'updatedAt,desc'];

export const Wanted: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [wantedData, setWantedData] = useState<WantedPage | null>(null);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeRequestIdRef = useRef<number>(0);

  const sanitizedParams = useMemo((): WantedQueryParams => {
    const rawPage = parseInt(searchParams.get('page') || '0', 10);
    const page = !isNaN(rawPage) && rawPage >= 0 ? rawPage : 0;

    const rawSize = parseInt(searchParams.get('size') || '20', 10);
    const size = VALID_SIZES.includes(rawSize as 10 | 20 | 50) ? (rawSize as 10 | 20 | 50) : 20;

    const rawStatus = searchParams.get('status');
    const status = VALID_STATUSES.includes(rawStatus as WantedStatus)
      ? (rawStatus as WantedStatus)
      : undefined;

    const rawFruit = searchParams.get('fruit');
    const fruit = VALID_FRUITS.includes(rawFruit as FruitFilter)
      ? (rawFruit as FruitFilter)
      : undefined;

    const crewId = searchParams.get('crewId') || undefined;
    const q = searchParams.get('q') || undefined;

    const rawSort = searchParams.get('sort');
    const sort: WantedSortOption = VALID_SORTS.includes(rawSort as WantedSortOption)
      ? (rawSort as WantedSortOption)
      : 'bounty,desc';

    return { page, size, status, crewId, fruit, q, sort };
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchCrews = async () => {
      try {
        const data = await bountyService.getCrews();
        if (isMounted) setCrews(data);
      } catch {
        // Manejo silencioso
      }
    };
    fetchCrews();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchWantedList = useCallback(async () => {
    const controller = new AbortController();
    const currentRequestId = ++activeRequestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const data = await bountyService.getWanted(sanitizedParams, controller.signal);

      if (currentRequestId !== activeRequestIdRef.current) {
        return;
      }

      setWantedData(data);

      if (data.totalPages > 0 && sanitizedParams.page !== undefined && sanitizedParams.page >= data.totalPages) {
        const updated = new URLSearchParams(searchParams);
        updated.set('page', String(data.totalPages - 1));
        setSearchParams(updated, { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CanceledError') {
        return;
      }
      if (currentRequestId === activeRequestIdRef.current) {
        setError(getApiErrorMessage(err, 'No se pudieron recuperar los carteles de Se Busca.'));
      }
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }

    return () => {
      controller.abort();
    };
  }, [sanitizedParams, searchParams, setSearchParams]);

  useEffect(() => {
    fetchWantedList();
  }, [fetchWantedList]);

  const handleFilterUpdate = (newFilters: {
    status?: WantedStatus;
    crewId?: string;
    fruit?: FruitFilter;
    sort?: WantedSortOption;
    size?: 10 | 20 | 50;
  }) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', '0');

    if (newFilters.status !== undefined) {
      if (newFilters.status) next.set('status', newFilters.status);
      else next.delete('status');
    }
    if (newFilters.crewId !== undefined) {
      if (newFilters.crewId) next.set('crewId', newFilters.crewId);
      else next.delete('crewId');
    }
    if (newFilters.fruit !== undefined) {
      if (newFilters.fruit) next.set('fruit', newFilters.fruit);
      else next.delete('fruit');
    }
    if (newFilters.sort !== undefined) {
      if (newFilters.sort && newFilters.sort !== 'bounty,desc') next.set('sort', newFilters.sort);
      else next.delete('sort');
    }
    if (newFilters.size !== undefined) {
      if (newFilters.size && newFilters.size !== 20) next.set('size', String(newFilters.size));
      else next.delete('size');
    }

    setSearchParams(next);
  };

  const handleSearchUpdate = (newSearch: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', '0');
    if (newSearch.trim()) {
      next.set('q', newSearch.trim());
    } else {
      next.delete('q');
    }
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const currentPage = sanitizedParams.page || 0;
  const totalPages = wantedData?.totalPages || 0;
  const totalElements = wantedData?.totalElements || 0;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-serif flex items-center gap-3">
            <Skull className="h-8 w-8 text-amber-400" />
            Carteles de "Se Busca"
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Recompensas oficiales de la Marina y la Guild en el East Blue
          </p>
        </div>

        {wantedData && (
          <div className="text-sm font-mono text-slate-400 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl">
            Total: <span className="text-amber-400 font-bold">{totalElements}</span> carteles
          </div>
        )}
      </div>

      <WantedFilters
        q={sanitizedParams.q || ''}
        status={sanitizedParams.status}
        crewId={sanitizedParams.crewId}
        fruit={sanitizedParams.fruit}
        sort={sanitizedParams.sort || 'bounty,desc'}
        size={sanitizedParams.size || 20}
        crews={crews}
        onSearchChange={handleSearchUpdate}
        onFilterChange={handleFilterUpdate}
        onReset={handleResetFilters}
      />

      <div className="min-h-[500px]">
        {loading ? (
          <WantedSkeleton count={sanitizedParams.size || 20} />
        ) : error ? (
          <div className="py-12 max-w-xl mx-auto">
            <ErrorState
              title="Error al consultar carteles"
              message={error}
              onRetry={fetchWantedList}
            />
          </div>
        ) : !wantedData || wantedData.content.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No se encontraron carteles"
              message="No hay criminales que coincidan con la búsqueda o filtros aplicados."
              actionText="Restablecer todos los filtros"
              onAction={handleResetFilters}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wantedData.content.map((pirate) => (
                <WantedCard key={pirate.id} pirate={pirate} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <div className="text-xs text-slate-400">
                  Mostrando página <span className="font-bold text-white">{currentPage + 1}</span> de{' '}
                  <span className="font-bold text-white">{totalPages}</span> ({totalElements} resultados)
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                    title="Primera página"
                    className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <span className="px-3 py-2 text-xs font-mono font-bold text-amber-400 bg-slate-900 border border-slate-800 rounded-lg">
                    {currentPage + 1} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/80 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    title="Última página"
                    className="p-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
