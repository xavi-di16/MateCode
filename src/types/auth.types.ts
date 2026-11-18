import type { User } from 'firebase/auth';

export type AuthUser = Pick<
    User,
    'uid' | 'email' | 'displayName' | 'emailVerified' | 'getIdToken'
>;

export interface AuthFormValues {
    email: string;
    password: string;
}

export interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    register: (values: AuthFormValues) => Promise<void>;
    login: (values: AuthFormValues) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}