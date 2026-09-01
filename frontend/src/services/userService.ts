import apiClient from '../lib/apiClient';
import { User } from '../types/auth';

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
}

export const userService = {
  updateProfile: (data: UpdateProfileRequest): Promise<{ success: boolean; data: User }> => {
    return apiClient<{ success: boolean; data: User }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
