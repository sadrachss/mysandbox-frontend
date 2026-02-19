import api from './client';

// Overview
export const adminService = {
  // Overview
  getOverview: async () => {
    const { data } = await api.get('/admin/overview');
    return data;
  },

  // Users
  getUsers: async (params?: { search?: string; plan?: string; status?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  updateUser: async (id: string, body: any) => {
    const { data } = await api.put(`/admin/users/${id}`, body);
    return data;
  },

  createUser: async (body: { email: string; password: string; username: string; displayName: string; plan?: string }) => {
    const { data } = await api.post('/admin/users', body);
    return data;
  },

  banUser: async (id: string) => {
    const { data } = await api.post(`/admin/users/${id}/ban`);
    return data;
  },

  unbanUser: async (id: string) => {
    const { data } = await api.post(`/admin/users/${id}/unban`);
    return data;
  },

  // Links
  getLinks: async (params?: { search?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/admin/links', { params });
    return data;
  },

  deleteLink: async (id: string) => {
    const { data } = await api.delete(`/admin/links/${id}`);
    return data;
  },

  // Analytics
  getAnalytics: async (days?: number) => {
    const { data } = await api.get('/admin/analytics', { params: { days } });
    return data;
  },

  // Logs
  getLogs: async (params?: { action?: string; page?: number; limit?: number }) => {
    const { data } = await api.get('/admin/logs', { params });
    return data;
  },

  // System Config
  getConfig: async () => {
    const { data } = await api.get('/admin/config');
    return data;
  },

  updateConfig: async (key: string, value: any) => {
    const { data } = await api.put('/admin/config', { key, value });
    return data;
  },
};
