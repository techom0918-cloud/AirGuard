import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = (): admin.app.App | null => {
  if (firebaseApp) return firebaseApp;

  if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0]!;
    return firebaseApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const hasValidEnvCreds =
    projectId &&
    clientEmail &&
    privateKey &&
    !clientEmail.includes('example.com') &&
    !privateKey.includes('YOUR_DEVELOPMENT_PRIVATE_KEY');

  if (hasValidEnvCreds) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return firebaseApp;
    } catch (error: any) {
      throw new Error(`FIRESTORE_INITIALIZATION_FAILED: ${error?.message || error}`);
    }
  }

  try {
    firebaseApp = admin.initializeApp();
    return firebaseApp;
  } catch (error) {
    return null;
  }
};

export const getFirestore = (): admin.firestore.Firestore => {
  const app = initializeFirebase();
  if (!app) {
    throw new Error('FIRESTORE_READ_FAILED: Firestore is not initialized. Ensure valid Firebase credentials exist in environment.');
  }
  return admin.firestore(app);
};

export default getFirestore;
