import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

/** .env.local-д хуулсан URL-д зай, хашилт, BOM зэргийг арилгана */
function normalizeRealtimeDatabaseUrl(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  let u = String(raw).replace(/^\uFEFF/, '').trim();
  if (!u) return undefined;
  if ((u.startsWith('"') && u.endsWith('"')) || (u.startsWith("'") && u.endsWith("'"))) {
    u = u.slice(1, -1).trim();
  }
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u}`;
  }
  return u.replace(/\/+$/, '');
}

const databaseURL = normalizeRealtimeDatabaseUrl(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function assertRtdbUrlOk(url: string | undefined): void {
  if (!url?.trim()) {
    throw new Error(
      '[Firebase] NEXT_PUBLIC_FIREBASE_DATABASE_URL хоосон. Firebase Console → Realtime Database → Data tab дээрх бүрэн https URL-ийг .env.local-д хуулна.',
    );
  }
  if (url.includes('firestore.googleapis.com')) {
    throw new Error(
      '[Firebase] Таны URL Firestore-т хамаатай. Realtime Database идэвхжүүлж, Data tab дээрх URL (жишээ: …firebaseio.com эсвэл …firebasedatabase.app) ашиглана.',
    );
  }
  if (!/\.(firebaseio\.com|firebasedatabase\.app)(:\d+)?(\/|$)/i.test(url)) {
    throw new Error(
      `[Firebase] Realtime Database URL танигдахгүй байна: ${url.slice(0, 48)}… ` +
        'Зөв жишээ: https://ТӨСӨЛ-default-rtdb.firebaseio.com эсвэл https://ТӨСӨЛ-default-rtdb.REGION.firebasedatabase.app',
    );
  }
}

let cachedApp: FirebaseApp | undefined;
let cachedDb: Database | undefined;

/** Lazy: layout → provider импорт хийхэд getDatabase ажиллахгүй (build + хоосон env). */
export function getFirebaseApp(): FirebaseApp {
  if (!cachedApp) {
    cachedApp = getApps()[0] ?? initializeApp(firebaseConfig);
  }
  return cachedApp;
}

export function getFirebaseDb(): Database {
  if (!cachedDb) {
    assertRtdbUrlOk(databaseURL);
    const app = getFirebaseApp();
    try {
      cachedDb = databaseURL ? getDatabase(app, databaseURL) : getDatabase(app);
    } catch (e) {
      throw new Error(
        `[Firebase] Database URL буруу байна. .env.local → NEXT_PUBLIC_FIREBASE_DATABASE_URL-ийг Realtime Database → Data-аас дахин хуулна. Дотод алдаа: ${e}`,
      );
    }
  }
  return cachedDb;
}

export const DEFAULT_USER_ID = 'GANTULGA_TSERENCHIMED';
export const DEFAULT_ACCOUNT_ID = '5466262686';
export const BASE_PATH = `users/${DEFAULT_USER_ID}`;
