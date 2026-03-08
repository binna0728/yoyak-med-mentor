import apiClient from './client';
import type { SignupRequest, LoginRequest, LoginResponse, User, UpdateUserRequest } from '@/types/user';

export const authApi = {
  signup: async (data: SignupRequest): Promise<User> => {
    const response = await apiClient.post<User>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.get<LoginResponse>('/auth/token/refresh');
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  updateMe: async (data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },

  updateProfile: async (data: Partial<UpdateUserRequest>): Promise<User> => {
    const response = await apiClient.patch<User>('/users/me', data);
    return response.data;
  },
};

export default authApi;
