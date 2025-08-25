import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we're in a build environment and env vars are missing
const isBuildTime =
  process.env.NODE_ENV === 'production' &&
  !process.env.VERCEL_ENV &&
  !process.env.VERCEL_URL;
const hasRequiredVars = Object.values(requiredEnvVars).every(
  (val) => val && val.length > 0
);

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

// Only initialize Firebase if we have all required environment variables
// Skip initialization during build time if env vars are missing
if (hasRequiredVars && !isBuildTime) {
  try {
    const firebaseConfig = requiredEnvVars;

    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    // Continue without Firebase for build-time scenarios
  }
}

// Lazy initialization function for API routes
export function initializeFirebase() {
  if (!app && hasRequiredVars) {
    try {
      const firebaseConfig = requiredEnvVars;
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    } catch (error) {
      console.error('Firebase lazy initialization failed:', error);
      throw new Error('Firebase initialization failed');
    }
  }

  if (!app || !db) {
    throw new Error(
      'Firebase not properly initialized - check environment variables'
    );
  }

  return { app, auth, db, storage };
}

export { app, auth, db, storage };
