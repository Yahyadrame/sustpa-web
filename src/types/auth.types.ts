// ✅ CORRIGÉ — AuthTokens supprimé, AuthResponse ne contient plus les tokens
export type AppRole =
  | "ADMIN"
  | "STUDENT"
  | "TEACHER"
  | "RESPONSIBLE"
  | "JURY_MEMBER";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  avatarUrl?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ✅ Plus d'accessToken / refreshToken — cookies httpOnly côté serveur
export interface AuthResponse {
  requiresPasswordChange: boolean;
  user: AuthUser;
}

export interface VerifyOtpPayload {
  otpCode: string;
}

export interface VerifyOtpResponse {
  message: string;
  otpVerified: true;
}
