export type Gender = 'MALE' | 'FEMALE';

export interface User {
  id: number;
  email: string;
  name: string;
  gender: Gender;
  birthday: string;
  phone_number: string;
  is_active: boolean;
  is_admin: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  gender: Gender;
  birthday: string;
  phone_number: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UpdateUserRequest {
  name?: string;
  gender?: Gender;
  birthday?: string;
  phone_number?: string;
}
