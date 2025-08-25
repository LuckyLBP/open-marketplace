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

const hasRequiredVars = Object.values(requiredEnvVars).every(
  (val) => val && val.length > 0
);

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

// Initialize Firebase for client-side or when env vars are available
function initializeFirebaseApp() {
  if (!app && hasRequiredVars) {
    try {
      const firebaseConfig = requiredEnvVars;
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
    } catch (error) {
      console.error('Firebase initialization failed:', error);
    }
  }
}

// Initialize immediately if we have env vars and we're not in Node.js build context
if (hasRequiredVars) {
  // Only skip during SSR/build if we explicitly detect build environment
  const isServerBuild =
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    !process.env.VERCEL_ENV;

  if (!isServerBuild) {
    initializeFirebaseApp();
  }
}

// Lazy initialization function for API routes and client-side
export function initializeFirebase() {
  if (!app && hasRequiredVars) {
    initializeFirebaseApp();
  }

  if (!app || !db) {
    throw new Error(
      'Firebase not properly initialized - check environment variables'
    );
  }

  return { app, auth, db, storage };
}

// Client-side hook to ensure Firebase is initialized
export function useFirebaseApp() {
  if (typeof window !== 'undefined' && !app && hasRequiredVars) {
    initializeFirebaseApp();
  }
  return { app, auth, db, storage };
}

export { app, auth, db, storage };
