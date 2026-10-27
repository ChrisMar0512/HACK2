import { apiClient } from '../api/apiClient';
import type { LoginPayload, LoginResponse, MeResponse, RegisterPayload } from '../types/auth.types';

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', payload);
    return response.data;
  },

  async getMe(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  },
};
