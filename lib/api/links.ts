import api from './client';

export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  position: number;
  isActive: boolean;
  scheduledStart?: string;
  scheduledEnd?: string;
}

export const linksService = {
  getAll: async () => {
    const response = await api.get('/links');
    return response.data.links;
  },
  
  create: async (data: Partial<Link>) => {
    const response = await api.post('/links', data);
    return response.data.link;
  },
  
  update: async (id: string, data: Partial<Link>) => {
    const response = await api.put(`/links/${id}`, data);
    return response.data.link;
  },
  
  delete: async (id: string) => {
    await api.delete(`/links/${id}`);
  },
  
  reorder: async (linkIds: string[]) => {
    await api.post('/links/reorder', { linkIds });
  },
};
