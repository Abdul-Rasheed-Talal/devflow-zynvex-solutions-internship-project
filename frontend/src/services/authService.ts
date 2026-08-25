import apiClient from '../lib/apiClient';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  LogoutResponse
} from '../types/auth';

/**
 * Authentication service handling communication with the backend.
 * Tokens are managed entirely by the browser via HttpOnly cookies.
 */
export const authService = {
  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: (): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/auth/me', {
      method: 'GET',
    });
  },

  logout: (): Promise<LogoutResponse> => {
    return apiClient<LogoutResponse>('/auth/logout', {
      method: 'POST',
    });
  },
};
