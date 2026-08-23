// types/auth.types.ts
// ─── Authentication Data Shapes ───────────────────────────────────────────────

/** The decoded user stored in AuthContext (NOT the raw JWT) */
export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  organizationId: string;
  facilityId: string | null;
}

/** Shape returned by POST /api/v1/auth/login */
export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

/** Shape of the AuthContext value */
export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}
