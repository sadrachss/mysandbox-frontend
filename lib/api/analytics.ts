import api from './client';

export interface AnalyticsData {
  totalClicks: number;
  linkStats: {
    linkId: string;
    title: string;
    url: string;
    clicks: number;
  }[];
  isPro: boolean;
  retentionDays: number;
}

export const analyticsService = {
  get: async (): Promise<AnalyticsData> => {
    const response = await api.get('/analytics');
    return response.data;
  },
};
