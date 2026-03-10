'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/Navbar';
import { doc, updateDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

function SettingsContent() {
    const { user, userData, refreshUserData } = useAuth();
    const [geminiKey, setGeminiKey] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSaveKey = async () => {
        if (!user) return;
        setSaving(true);
        await updateDoc(doc(getDb(), 'users', user.uid), {
            geminiApiKey: geminiKey,
        });
        await refreshUserData();
        setSaving(false);
        setSaved(true);
        setGeminiKey('');
        setTimeout(() => setSaved(false), 3000);
    };

    const maskKey = (key: string) => {
        if (!key) return 'Not set';
        return key.substring(0, 4) + '...' + key.substring(key.length - 4);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 py-10 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white">Settings</h1>

                {/* Account Info */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Account</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <span className="text-sm text-gray-400 block mb-1">Email</span>
                            <span className="text-white">{userData?.email}</span>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <span className="text-sm text-gray-400 block mb-1">Role</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${userData?.role === 'admin' ? 'bg-amber-600/20 text-amber-400' :
                                userData?.role === 'pro' ? 'bg-indigo-600/20 text-indigo-400' :
                                    'bg-emerald-600/20 text-emerald-400'
                                }`}>
                                {userData?.role === 'admin' ? '🛡️' : userData?.role === 'pro' ? '⭐' : '🟢'}
                                {userData?.role?.toUpperCase()}
                            </span>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <span className="text-sm text-gray-400 block mb-1">Credits Remaining</span>
                            <span className="text-2xl font-bold text-indigo-400">
                                {userData?.role === 'admin' ? '∞' : userData?.credits ?? 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Gemini API Key */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Gemini API Key</h2>
                    <p className="text-sm text-gray-400">
                        Provide your own Gemini API key to use instead of the platform default. Your key is stored securely in your profile.
                    </p>

                    <div className="bg-gray-800/50 rounded-xl p-4">
                        <span className="text-sm text-gray-400 block mb-1">Current Key</span>
                        <span className="font-mono text-gray-300">{maskKey(userData?.geminiApiKey || '')}</span>
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="flex-1 px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                        <button
                            onClick={handleSaveKey}
                            disabled={saving || !geminiKey}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Key'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    );
}
