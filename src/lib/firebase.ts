import { getApp, getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const satisfies ReadonlyArray<keyof ImportMetaEnv>;

type RequiredKey = (typeof requiredKeys)[number];

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const collectEnv = () => {
  const env = import.meta.env;
  const missing = requiredKeys.filter((key) => !env[key]);

  return {
    missing,
    config: {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
    } satisfies FirebaseConfig,
  } as const;
};

const { missing: missingKeys, config } = collectEnv();

let firebaseApp: FirebaseApp | null = null;
let firestore: Firestore | null = null;

export const isFirebaseConfigured = (): boolean => missingKeys.length === 0;

export const getMissingFirebaseKeys = (): ReadonlyArray<RequiredKey> => missingKeys;

export const getFirebaseApp = (): FirebaseApp => {
  if (!isFirebaseConfigured()) {
    throw new Error(
      `Firebase is not configured. Missing env keys: ${missingKeys.join(', ') || 'unknown'}`,
    );
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length ? getApp() : initializeApp(config);
  return firebaseApp;
};

export const getDb = (): Firestore => {
  if (firestore) {
    return firestore;
  }

  firestore = getFirestore(getFirebaseApp());
  return firestore;
};
