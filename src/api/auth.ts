import apiClient from './client';
import type {
  LoginResponse,
  User,
  UpdateUserRequest,
  ApiResponse,
} from '@/types/user';

export const authApi = {
  tossLogin: async (tossToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/toss/login', {
      toss_token: tossToken,
    });
    return response.data;
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.get<LoginResponse>('/auth/token/refresh');
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  updateMe: async (data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return response.data;
  },

  updateProfile: async (data: Partial<UpdateUserRequest>): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return response.data;
  },
};

export default authApi;
