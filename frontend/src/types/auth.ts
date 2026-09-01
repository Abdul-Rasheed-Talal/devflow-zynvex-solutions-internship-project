export interface User {
  id: string;
  name: string;
  email: string;
  accountType: 'personal' | 'company';
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export type LoginRequest = Pick<User, 'email'> & { password: string };
export type RegisterRequest = Pick<User, 'name' | 'email' | 'accountType'> & { password: string };
