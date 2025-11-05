import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const hasRequiredVars = Object.values(requiredEnvVars).every(Boolean);

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let initPromise: Promise<void> | null = null;

async function initializeFirebaseApp() {
  if (!hasRequiredVars) {
    console.warn('Firebase: Missing required environment variables');
    return;
  }

  // Prevent multiple parallel initializations
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const firebaseConfig = requiredEnvVars;

      // Om det redan finns en app men för FEL projekt → stäng den och initiera om
      const apps = getApps();
      if (apps.length) {
        const existing = getApp();
        // @ts-ignore
        const existingProject = existing.options?.projectId;
        if (existingProject !== firebaseConfig.projectId) {
          await deleteApp(existing);
        }
      }

      app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);

      // 🔎 DEBUG: logga alltid vilket projekt klienten kör mot
      if (typeof window !== 'undefined') {
        // @ts-ignore
        const opts = app.options || {};
        console.log('FB DEBUG', {
          projectId: opts.projectId,
          storageBucket: opts.storageBucket,
          envProjectId: firebaseConfig.projectId,
          envBucket: firebaseConfig.storageBucket,
        });
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

// init direkt på klienten om vi kan
if (hasRequiredVars && typeof window !== 'undefined') {
  initializeFirebaseApp().catch((err) =>
    console.error('Firebase init failed:', err)
  );
}

export async function initializeFirebase() {
  await initializeFirebaseApp();
  if (!app || !db) {
    throw new Error('Firebase not properly initialized - check env variables');
  }
  return { app, auth, db, storage };
}

export function useFirebaseApp() {
  if (typeof window !== 'undefined' && !app && hasRequiredVars) {
    initializeFirebaseApp().catch((err) =>
      console.error('Firebase init failed:', err)
    );
  }
  return { app, auth, db, storage };
}

// Lazy getters to ensure we wait for initialization
export function getDb() {
  if (!db) {
    throw new Error(
      'Firebase Firestore not initialized. Ensure env variables are set.'
    );
  }
  return db;
}

export function getAuth2() {
  if (!auth) {
    throw new Error(
      'Firebase Auth not initialized. Ensure env variables are set.'
    );
  }
  return auth;
}

export { app, auth, db, storage };
