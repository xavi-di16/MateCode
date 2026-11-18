import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import { AuthContext } from './AuthContext';
import * as service from './authService';
import type {
    AuthContextValue,
    AuthUser,
} from '../../types/auth.types';
import { getAuthErrorMessage } from '../../utils/firebaseErrors';

export function Authenticator({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(
        () =>
            service.subscribeToAuthChanges(
                current => {
                    setUser(current);
                    setLoading(false);
                },
                failure => {
                    setUser(null);
                    setError(getAuthErrorMessage(failure));
                    setLoading(false);
                },
            ),
        [],
    );

    const clearError = useCallback(() => setError(null), []);

    const run = useCallback(
        async (operation: () => Promise<unknown>) => {
            setError(null);

            try {
                await operation();
            } catch (failure) {
                setError(getAuthErrorMessage(failure));
                throw failure;
            }
        },
        [],
    );

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            error,
            clearError,
            register: values => run(() => service.registerWithEmail(values)),
            login: values => run(() => service.loginWithEmail(values)),
            loginWithGoogle: () => run(service.loginWithGooglePopup),
            logout: () => run(service.logoutUser),
        }),
        [user, loading, error, clearError, run],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}