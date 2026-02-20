import api from './client';

export interface Profile {
  id: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  status: 'available' | 'busy' | 'hybrid';
  statusMessage?: string | null;
  contactUrl?: string | null;
  contactLabel?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface ProfileResponse {
  profile: Profile;
  user: {
    email: string;
    username: string;
    plan: 'FREE' | 'PRO';
  };
}

export interface UpdateProfileData {
  displayName?: string;
  bio?: string | null;
  status?: 'available' | 'busy' | 'hybrid';
  statusMessage?: string | null;
  contactUrl?: string | null;
  contactLabel?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export const profileService = {
  get: async (): Promise<ProfileResponse> => {
    const response = await api.get('/profile');
    return response.data;
  },

  update: async (data: UpdateProfileData): Promise<{ profile: Profile }> => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  changeUsername: async (username: string): Promise<{ username: string; message: string }> => {
    const response = await api.put('/profile/username', { username });
    return response.data;
  },

  checkUsername: async (username: string): Promise<{ available: boolean; reason?: string }> => {
    const response = await api.get(`/profile/check-username/${username}`);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string; filename: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAvatar: async (): Promise<void> => {
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
