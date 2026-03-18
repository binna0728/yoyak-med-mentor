import apiClient from './client';
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  User,
  UpdateUserRequest,
  ApiResponse,
} from '@/types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api/v1';

export const authApi = {
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await apiClient.post<SignupResponse>('/auth/signup', data);
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

  // Social login helpers - redirect to backend OAuth URLs
  getGoogleLoginUrl: (redirectUri?: string): string => {
    const params = redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : '';
    return `${API_BASE_URL}/auth/google/login${params}`;
  },

  getKakaoLoginUrl: (redirectUri?: string): string => {
    const params = redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : '';
    return `${API_BASE_URL}/auth/kakao/login${params}`;
  },
};

export default authApi;
