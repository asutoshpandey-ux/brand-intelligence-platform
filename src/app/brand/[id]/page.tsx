'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { ProtectedRoute } from '@/components/Navbar';
import type { BrandDNA } from '@/lib/extractors';
import Image from 'next/image';

function BrandProfileContent() {
    const { user } = useAuth();
    const params = useParams();
    const id = params.id as string;
    const [brand, setBrand] = useState<BrandDNA | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState('');

    useEffect(() => {
        async function load() {
            if (!user) return;
            const docRef = doc(getDb(), 'brands', user.uid, 'analyses', id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setBrand(snap.data() as BrandDNA);
            }
            setLoading(false);
        }
        load();
    }, [user, id]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        setTimeout(() => setCopied(''), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <p className="text-gray-400">Brand analysis not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{brand.brandName}</h1>
                            <a href={brand.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm mt-1 inline-block">
                                {brand.url} ↗
                            </a>
                            <p className="text-gray-500 text-xs mt-2">Analyzed: {new Date(brand.extractedAt).toLocaleString()}</p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(JSON.stringify(brand, null, 2), 'json')}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition flex items-center gap-2"
                        >
                            {copied === 'json' ? '✓ Copied!' : '📋 Export JSON'}
                        </button>
                    </div>
                </div>

                {/* Colors */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">🎨 Color Palette</h2>
                    <div className="grid grid-cols-5 gap-3 mb-4">
                        {['primary', 'secondary', 'accent', 'background', 'text'].map((key) => {
                            const color = brand.colors[key as keyof typeof brand.colors] as string;
                            return (
                                <button key={key} onClick={() => copyToClipboard(color, key)}
                                    className="group flex flex-col items-center gap-2">
                                    <div className="w-full aspect-square rounded-xl border-2 border-gray-700 group-hover:border-indigo-500 transition shadow-lg"
                                        style={{ backgroundColor: color }} />
                                    <span className="text-xs text-gray-400 capitalize">{key}</span>
                                    <span className="text-xs text-gray-500 font-mono">{copied === key ? '✓ Copied!' : color}</span>
                                </button>
                            );
                        })}
                    </div>
                    {brand.colors.allColors.length > 5 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
                            {brand.colors.allColors.slice(5).map((c, i) => (
                                <button key={i} onClick={() => copyToClipboard(c, `extra-${i}`)}
                                    className="w-8 h-8 rounded-lg border border-gray-700 hover:border-indigo-500 transition"
                                    style={{ backgroundColor: c }} title={c} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Fonts */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">🔤 Typography</h2>
                    {brand.fonts.families.length > 0 ? (
                        <div className="space-y-3">
                            {brand.fonts.families.map((font) => (
                                <div key={font} className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-3">
                                    <span className="text-white" style={{ fontFamily: font }}>{font}</span>
                                    <span className="text-lg text-gray-400" style={{ fontFamily: font }}>The quick brown fox</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No custom fonts detected.</p>
                    )}
                    {brand.fonts.googleFonts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-800">
                            <p className="text-sm text-gray-400">
                                Google Fonts: {brand.fonts.googleFonts.join(', ')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Logo */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">🖼️ Logo</h2>
                    {brand.logoUrl ? (
                        <div className="bg-gray-800/50 rounded-xl p-6 flex items-center justify-center">
                            <Image src={brand.logoUrl} alt={`${brand.brandName} logo`} width={200} height={96} className="max-h-24 max-w-full object-contain" unoptimized />
                        </div>
                    ) : (
                        <p className="text-gray-500">No logo detected.</p>
                    )}
                </div>

                {/* Brand Voice */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">🧠 Brand Voice</h2>
                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-gray-400 block mb-2">Personality</span>
                            <div className="flex gap-2">
                                {brand.voice.personality.map((p) => (
                                    <span key={p} className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-sm font-medium capitalize">{p}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-400 block mb-2">Tone</span>
                            <span className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm font-medium capitalize">{brand.voice.tone}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-400 block mb-2">Target Audience</span>
                            <p className="text-gray-300">{brand.voice.targetAudience}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-400 block mb-2">Voice Summary</span>
                            <p className="text-gray-300">{brand.voice.brandVoiceSummary}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BrandPage() {
    return (
        <ProtectedRoute>
            <BrandProfileContent />
        </ProtectedRoute>
    );
}
