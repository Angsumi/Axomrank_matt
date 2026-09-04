import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

export function getFirebaseAdminApp(): App | undefined {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

  if (serviceAccountKey) {
    try {
      const parsedKey = JSON.parse(serviceAccountKey);
      return initializeApp({
        credential: cert(parsedKey),
        projectId: parsedKey.project_id || projectId,
      });
    } catch {
      // Fall through if key string cannot be parsed
    }
  }

  if (projectId) {
    return initializeApp({
      projectId,
    });
  }

  return undefined;
}

export function getAdminFirestore() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getAdminMessaging() {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getMessaging(app);
}

export async function verifyFirebaseIdToken(idToken: string) {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  try {
    return await getAuth(app).verifyIdToken(idToken);
  } catch {
    return null;
  }
}
