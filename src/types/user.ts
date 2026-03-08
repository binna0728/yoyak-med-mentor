export type Gender = 'M' | 'F';

export interface User {
  user_id: string;
  email: string;
  name: string;
  nickname: string;
  gender: Gender;
  birthday: string;
  phone_number?: string;
  profile_image?: string;
  is_active: boolean;
  is_admin: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  name: string;
  birthday: string;
  gender: Gender;
  email_token: string;
  sms_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Wrapped API response format */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  status: 'error';
  error_code: string;
  error_detail: string;
  field_errors?: Record<string, string>;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  name: string;
  nickname?: string;
  profile_image?: string;
  is_new_user?: boolean;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface SignupResponseData {
  user_id: string;
  email: string;
  nickname: string;
  created_at: string;
}

export type SignupResponse = ApiResponse<SignupResponseData>;

export interface UpdateUserRequest {
  name?: string;
  nickname?: string;
  gender?: Gender;
  birthday?: string;
  phone_number?: string;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: {
    items: T[];
    pagination: PaginationInfo;
  };
}
