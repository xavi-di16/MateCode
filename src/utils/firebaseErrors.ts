import { FirebaseError } from 'firebase/app';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
    'auth/invalid-credential': 'El correo o la contraseña son incorrectos.',
    'auth/user-not-found': 'No existe una cuenta registrada con este correo.',
    'auth/wrong-password': 'La contraseña ingresada es incorrecta.',
    'auth/email-already-in-use': 'Ya existe una cuenta registrada con este correo.',
    'auth/invalid-email': 'El formato del correo electrónico no es válido.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intentá de nuevo más tarde.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de inicio de sesión con Google antes de completar el proceso.',
    'auth/network-request-failed': 'Error de red. Verificá tu conexión a internet.',
};

export function getAuthErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError) {
        return AUTH_ERROR_MESSAGES[error.code] ?? 'Ocurrió un error al autenticar. Intentá nuevamente.';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Ocurrió un error inesperado.';
}