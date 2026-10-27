import { apiClient } from '../api/apiClient';
import type { LogPose } from '../types/logpose.types';

export const logPoseService = {
  async getStatus(signal?: AbortSignal): Promise<LogPose> {
    const response = await apiClient.get<LogPose>('/log-pose', { signal });
    return response.data;
  },
};
