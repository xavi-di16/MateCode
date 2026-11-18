import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (Object.values(config).some(value => !value)) {
    throw new Error('Falta configurar Firebase. Revisá .env.example.');
}

const app = getApps().length ? getApp() : initializeApp(config);

// Firebase Auth utiliza persistencia local por defecto en el navegador.
export const auth = getAuth(app);
export const db = getFirestore(app);