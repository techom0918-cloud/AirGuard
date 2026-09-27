import admin from 'firebase-admin';
import { config } from './index.js';

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = (): admin.app.App | null => {
  if (firebaseApp) return firebaseApp;

  if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0]!;
    return firebaseApp;
  }

  // Check if valid non-placeholder credentials exist before attempting init
  const hasValidCreds =
    config.firebase.clientEmail &&
    config.firebase.privateKey &&
    !config.firebase.clientEmail.includes('example.com') &&
    !config.firebase.privateKey.includes('YOUR_DEVELOPMENT_PRIVATE_KEY');

  if (!hasValidCreds) {
    console.log('[Firebase Admin] Skipping Firebase initialization: Placeholder or missing credentials in environment.');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
    console.log('[Firebase Admin] Initialized successfully.');
    return firebaseApp;
  } catch (error) {
    console.warn('[Firebase Admin] Initialization failed:', error);
    return null;
  }
};

export const getFirestore = () => {
  const app = initializeFirebase();
  if (!app) return null;
  return admin.firestore();
};
