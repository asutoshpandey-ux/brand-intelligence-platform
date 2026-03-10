import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDRrSe8MOw-lIbqjXO7NRMPj0Uj99i9rdI",
  authDomain: "speech-agent-5e755.firebaseapp.com",
  projectId: "speech-agent-5e755",
  storageBucket: "speech-agent-5e755.firebasestorage.app",
  messagingSenderId: "159912098601",
  appId: "1:159912098601:web:09f5b0d492e47ed6519538",
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
