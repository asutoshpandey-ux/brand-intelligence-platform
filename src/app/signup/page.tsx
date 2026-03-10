'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const { signup, loginWithGoogle } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await signup(email, password);
            router.push('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await loginWithGoogle();
            router.push('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Google login failed');
        }
        setGoogleLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-indigo-500/5">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-600/20 rounded-xl mb-4">
                            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-gray-400 mt-1 text-sm">Start extracting brand intelligence</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                placeholder="you@company.com" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                placeholder="Min 6 characters" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                                placeholder="••••••••" required />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Creating Account...
                                </span>
                            ) : 'Sign Up'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-900/80 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={googleLoading || loading}
                            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {googleLoading ? (
                                <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            Google
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
