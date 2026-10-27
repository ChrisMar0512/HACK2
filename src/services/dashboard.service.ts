import { apiClient } from '../api/apiClient';
import type { DashboardSummary } from '../types/dashboard.types';

export const dashboardService = {
  async getSummary(signal?: AbortSignal): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary', { signal });
    return response.data;
  },
};
