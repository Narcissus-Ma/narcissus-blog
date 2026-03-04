import type { LoginRequest, LoginResponse } from '@narcissus/shared';

import { apiClient, unwrapResponse } from '@/services/api-client';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', payload);
    return unwrapResponse<LoginResponse>(response);
  },
};
