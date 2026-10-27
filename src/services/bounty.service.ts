import { apiClient } from '../api/apiClient';
import type { Crew, WantedDetail, WantedPage, WantedQueryParams } from '../types/bounty.types';

export const bountyService = {
  async getCrews(signal?: AbortSignal): Promise<Crew[]> {
    const response = await apiClient.get<Crew[]>('/crews', { signal });
    return response.data;
  },

  async getWanted(params: WantedQueryParams, signal?: AbortSignal): Promise<WantedPage> {
    const cleanParams: Record<string, string | number> = {};

    if (params.page !== undefined && params.page >= 0) {
      cleanParams.page = params.page;
    }
    if (params.size) {
      cleanParams.size = params.size;
    }
    if (params.status) {
      cleanParams.status = params.status;
    }
    if (params.crewId) {
      cleanParams.crewId = params.crewId;
    }
    if (params.fruit) {
      cleanParams.fruit = params.fruit;
    }
    if (params.q && params.q.trim().length > 0) {
      cleanParams.q = params.q.trim();
    }
    if (params.sort) {
      cleanParams.sort = params.sort;
    }

    const response = await apiClient.get<WantedPage>('/wanted', {
      params: cleanParams,
      signal,
    });
    return response.data;
  },

  async getWantedById(id: string, signal?: AbortSignal): Promise<WantedDetail> {
    const response = await apiClient.get<WantedDetail>(`/wanted/${id}`, { signal });
    return response.data;
  },
};
