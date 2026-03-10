import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

import { SECRETS } from './secrets';

const firebaseConfig = {
  apiKey: SECRETS.FIREBASE_API_KEY,
  authDomain: SECRETS.FIREBASE_AUTH_DOMAIN,
  projectId: SECRETS.FIREBASE_PROJECT_ID,
  storageBucket: SECRETS.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: SECRETS.FIREBASE_MESSAGING_SENDER_ID,
  appId: SECRETS.FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

function getFirebaseApp() {
  if (typeof window === 'undefined') return undefined;
  if (!firebaseConfig.apiKey) return undefined;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

function getFirebaseAuth(): Auth {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) throw new Error('Firebase app not initialized');
  if (!auth) auth = getAuth(firebaseApp);
  return auth;
}

function getFirebaseDb(): Firestore {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) throw new Error('Firebase app not initialized');
  if (!db) db = getFirestore(firebaseApp);
  return db;
}

function getFirebaseStorage(): FirebaseStorage {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) throw new Error('Firebase app not initialized');
  if (!storage) storage = getStorage(firebaseApp);
  return storage;
}

export {
  getFirebaseApp as getApp,
  getFirebaseAuth as getAuth,
  getFirebaseDb as getDb,
  getFirebaseStorage as getStorage,
};
