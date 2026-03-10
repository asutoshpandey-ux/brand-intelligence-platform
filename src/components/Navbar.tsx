'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useEffect } from 'react';

export default function Navbar() {
    const { user, userData, loading, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (loading) return null;

    return (
        <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-white font-bold text-lg">Brand Intel</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gray-800/60 rounded-lg border border-gray-700">
                                    <span className="text-xs text-gray-400">Credits:</span>
                                    <span className="text-sm font-bold text-indigo-400">{userData?.role === 'admin' ? '∞' : userData?.credits ?? 0}</span>
                                </div>
                                {userData?.role === 'admin' && (
                                    <Link href="/admin" className="text-sm text-gray-400 hover:text-white transition">Admin</Link>
                                )}
                                <Link href="/settings" className="text-sm text-gray-400 hover:text-white transition">Settings</Link>
                                <button onClick={handleLogout}
                                    className="text-sm text-gray-400 hover:text-red-400 transition">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">Login</Link>
                                <Link href="/signup"
                                    className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

// Protected route wrapper
export function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && requiredRole && userData?.role !== requiredRole) {
            router.push('/');
        }
    }, [user, userData, loading, router, requiredRole]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) return null;
    if (requiredRole && userData?.role !== requiredRole) return null;

    return <>{children}</>;
}
