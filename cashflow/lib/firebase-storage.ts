import { getStorage, ref, type FirebaseStorage } from 'firebase/storage';
import { getFirebaseApp } from '@/lib/firebase';

let cached: FirebaseStorage | undefined;

export function getFirebaseStorage(): FirebaseStorage {
  if (!cached) {
    cached = getStorage(getFirebaseApp());
  }
  return cached;
}

export function storagePathForUpload(userId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `users/${userId}/uploads/${Date.now()}_${safe}`;
}
