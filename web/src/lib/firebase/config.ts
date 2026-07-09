import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createFirebaseApp(): FirebaseApp {
  if (getApps().length) {
    return getApps()[0]!;
  }
  return initializeApp(firebaseConfig);
}

export function hasFirebaseEnv() {
  return Object.values(firebaseConfig).every(Boolean);
}

let cachedApp: FirebaseApp | null = null;

export function getFirebaseApp() {
  if (!hasFirebaseEnv()) {
    throw new Error("Firebase environment variables are missing.");
  }

  cachedApp ??= createFirebaseApp();
  return cachedApp;
}

export function getFirebaseAuthClient(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}
