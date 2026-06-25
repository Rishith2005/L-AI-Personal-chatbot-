import { apiClient } from './apiClient';
import type { Profile } from '../types';

export const authApi = {
  getProfile: async (): Promise<Profile> => {
    return apiClient('/api/auth/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (username: string | null, avatarUrl: string | null): Promise<Profile> => {
    return apiClient('/api/auth/profile', {
      method: 'POST',
      body: JSON.stringify({
        username,
        avatar_url: avatarUrl,
      }),
    });
  },
};
