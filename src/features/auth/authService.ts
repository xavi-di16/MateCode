import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    type Unsubscribe,
} from 'firebase/auth';

import { auth } from '../../services/firebase';
import type {
    AuthFormValues,
    AuthUser,
} from '../../types/auth.types';

export async function registerWithEmail({
    email,
    password,
}: AuthFormValues): Promise<AuthUser> {
    const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
    );

    return credential.user;
}

export async function loginWithEmail({
    email,
    password,
}: AuthFormValues): Promise<AuthUser> {
    const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
    );

    return credential.user;
}

export async function loginWithGooglePopup(): Promise<AuthUser> {
    const credential = await signInWithPopup(
        auth,
        new GoogleAuthProvider(),
    );

    return credential.user;
}

export async function logoutUser(): Promise<void> {
    await signOut(auth);
}

export function subscribeToAuthChanges(
    onUser: (user: AuthUser | null) => void,
    onError: (error: Error) => void,
): Unsubscribe {
    return onAuthStateChanged(auth, onUser, onError);
}