import type { SiteSetting } from '@narcissus/shared';

import { apiClient, unwrapResponse } from '@/services/api-client';

export const siteService = {
  async getPublicSiteSetting(): Promise<SiteSetting> {
    const response = await apiClient.get('/site-settings/public');
    return unwrapResponse<SiteSetting>(response);
  },
};
