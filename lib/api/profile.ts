import api from './client';

export interface Profile {
  id: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export const profileService = {
  get: async () => {
    const response = await api.get('/profile');
    return response.data.profile;
  },

  update: async (data: Partial<Profile>) => {
    const response = await api.put('/profile', data);
    return response.data.profile;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAvatar: async () => {
    await api.delete('/upload/avatar');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/profile/change-password', { currentPassword, newPassword });
    return response.data;
  },

  deleteAccount: async (password: string, confirmation: string) => {
    const response = await api.post('/profile/delete-account', { password, confirmation });
    return response.data;
  },
};
