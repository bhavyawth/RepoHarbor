import { api } from '../../api/client'; 

export interface User {
  _id: string;
  githubId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  displayName?: string;
}

export const authApi = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refreshToken: async (): Promise<void> => {
    await api.get('/auth/refresh-token');
  },
};