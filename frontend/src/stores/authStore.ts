import { create } from 'zustand';
import { User, LoginRequest } from '../types/auth';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  initializeAuth: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

/**
 * Global authentication store.
 * Source of truth for frontend auth state.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  initializeAuth: async () => {
    try {
      const response = await authService.getCurrentUser();
      set({
        user: response.data,
        isAuthenticated: true,
        isInitializing: false
      });
    } catch (error) {
      // 401 or network error -> Unauthenticated
      set({
        user: null,
        isAuthenticated: false,
        isInitializing: false
      });
    }
  },

  login: async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    set({
      user: response.data,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      // Always clear local state on logout regardless of API response
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  updateUser: (user: User) => {
    set({ user });
  },
}));
