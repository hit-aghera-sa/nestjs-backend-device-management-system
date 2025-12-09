export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "MASTER" | "ADMIN";
}

export interface AuthState {
  token: string | null;
  user: AdminUser | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    admin: AdminUser;
  };
}
