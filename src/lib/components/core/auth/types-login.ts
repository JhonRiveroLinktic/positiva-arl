export interface Usuario {
  id: string;
  email: string;
  nombres?: string;
  apellidos?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
  user_type?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: Usuario;
  error?: string;
}