import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL:       process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedApp: FirebaseApp | undefined;
let cachedDb: Database | undefined;

/** Lazy init — Vercel `next build` prerender дээр модуль ачаалахад getDatabase дуудагдахгүй. */
export function getFirebaseApp(): FirebaseApp {
  if (!cachedApp) {
    cachedApp = getApps()[0] ?? initializeApp(firebaseConfig);
  }
  return cachedApp;
}

export function getFirebaseDb(): Database {
  if (!cachedDb) {
    cachedDb = getDatabase(getFirebaseApp());
  }
  return cachedDb;
}

function bindProxy<T extends object>(getReal: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const real = getReal();
      const value = Reflect.get(real, prop, receiver);
      return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real) : value;
    },
  });
}

export const app = bindProxy(getFirebaseApp);
export const db  = bindProxy(getFirebaseDb);

export const DEFAULT_USER_ID = 'GANTULGA_TSERENCHIMED';
export const DEFAULT_ACCOUNT_ID = '5466262686';
export const BASE_PATH = `users/${DEFAULT_USER_ID}`;
