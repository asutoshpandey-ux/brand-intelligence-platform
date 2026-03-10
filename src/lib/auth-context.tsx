'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { getAuth, getDb } from '@/lib/firebase';

export interface UserData {
    email: string;
    role: 'admin' | 'pro' | 'free' | 'guest';
    credits: number;
    geminiApiKey?: string;
    createdAt: unknown;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (uid: string) => {
        try {
            const database = getDb();
            const docRef = doc(database, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserData(docSnap.data() as UserData);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        try {
            const firebaseAuth = getAuth();
            unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                setUser(user);
                if (user) {
                    await fetchUserData(user.uid);
                } else {
                    setUserData(null);
                }
                setLoading(false);
            });
        } catch {
            // Firebase not initialized (e.g., during build)
            setLoading(false);
        }
        return () => unsubscribe?.();
    }, []);

    const login = async (email: string, password: string) => {
        const firebaseAuth = getAuth();
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        await fetchUserData(cred.user.uid);
    };

    const signup = async (email: string, password: string) => {
        const firebaseAuth = getAuth();
        const database = getDb();
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const userDocRef = doc(database, 'users', cred.user.uid);
        const newUser: UserData = {
            email,
            role: 'free',
            credits: 10,
            createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newUser);
        setUserData(newUser);
    };

    const logout = async () => {
        try {
            const firebaseAuth = getAuth();
            await signOut(firebaseAuth);
        } catch {
            // ignore
        }
        setUser(null);
        setUserData(null);
    };

    const loginWithGoogle = async () => {
        const firebaseAuth = getAuth();
        const database = getDb();
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(firebaseAuth, provider);

        // Check if user document exists, if not create it
        const userDocRef = doc(database, 'users', cred.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const newUser: UserData = {
                email: cred.user.email || '',
                role: 'free',
                credits: 10,
                createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newUser);
            setUserData(newUser);
        } else {
            setUserData(userDoc.data() as UserData);
        }
    };

    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user.uid);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, login, loginWithGoogle, signup, logout, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
