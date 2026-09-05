export interface User {
  id: string;
  name: string;
  email: string;
  accountType: 'personal' | 'company';
  companyName?: string;
  subscriptionPlan?: 'basic' | 'pro';
  bio?: string;
  skills?: string[];
  avatarUrl?: string;
  githubUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
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
export type RegisterRequest = Pick<User, 'name' | 'email' | 'accountType' | 'companyName'> & { password: string };
