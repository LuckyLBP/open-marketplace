// lib/firebaseAdmin.ts
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getServiceAccount() {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !rawKey) {
        throw new Error(
            'Missing FIREBASE_ADMIN_* env. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in .env.local'
        );
    }

    const privateKey = rawKey.trim().replace(/\\n/g, '\n'); // trim tar ev. inledande mellanslag

    return {
        // camelCase
        projectId,
        clientEmail,
        privateKey,
        // underscore – vissa SDK-varianter kräver dessa
        project_id: projectId,
        client_email: clientEmail,
        private_key: privateKey,
    } as any;
}

const app = getApps().length
    ? getApps()[0]!
    : initializeApp({
        credential: cert(getServiceAccount()),
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
