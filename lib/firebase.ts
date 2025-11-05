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

function initializeFirebaseSync() {
  if (!hasRequiredVars || app) return;

  try {
    const firebaseConfig = requiredEnvVars;
    const apps = getApps();

    if (apps.length) {
      app = getApp();
    } else {
      app = initializeApp(firebaseConfig);
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    if (typeof window !== 'undefined') {
      // @ts-ignore
      const opts = app.options || {};
      console.log('FB DEBUG', {
        projectId: opts.projectId,
        storageBucket: opts.storageBucket,
      });
    }
  } catch (error) {
    console.error('Firebase sync initialization error:', error);
  }
}

// Initialize immediately on page load (synchronously on the client)
if (typeof window !== 'undefined' && hasRequiredVars) {
  initializeFirebaseSync();
}

export async function initializeFirebase() {
  // Ensure sync initialization happened
  if (!app && hasRequiredVars) {
    initializeFirebaseSync();
  }

  if (!app || !db) {
    throw new Error('Firebase not properly initialized - check env variables');
  }
  return { app, auth, db, storage };
}

export function useFirebaseApp() {
  if (typeof window !== 'undefined' && !app && hasRequiredVars) {
    initializeFirebaseSync();
  }
  return { app, auth, db, storage };
}

export { app, auth, db, storage };
