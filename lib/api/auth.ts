import api from './client';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName: string;
  languagePreference?: 'pt-BR' | 'en' | 'es';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};
