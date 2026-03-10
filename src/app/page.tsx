'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export default function HomePage() {
  const { user, userData, refreshUserData } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) {
      router.push('/login');
      return;
    }

    if (userData.role !== 'admin' && userData.credits <= 0) {
      setError('No credits remaining. Contact your admin for more.');
      return;
    }

    setLoading(true);
    setError('');
    setProgress('Crawling website...');

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          geminiKey: userData.geminiApiKey || undefined,
        }),
      });

      setProgress('Extracting brand DNA...');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Crawl failed');
      }

      const db = getDb();

      if (userData.role !== 'admin') {
        await updateDoc(doc(db, 'users', user.uid), {
          credits: increment(-1),
        });
        await refreshUserData();
      }

      setProgress('Saving results...');
      const brandRef = await addDoc(collection(db, 'brands', user.uid, 'analyses'), data.data);

      router.push(`/brand/${brandRef.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }

    setLoading(false);
    setProgress('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Powered by Gemini AI
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Extract Any Brand&apos;s
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            DNA in Seconds
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Paste any website URL and get instant brand intelligence — colors, fonts, logo, and AI-powered voice analysis.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-3 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-2 shadow-2xl shadow-indigo-500/5">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none text-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/25 whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : 'Analyze Brand'}
            </button>
          </div>

          {progress && (
            <p className="text-indigo-400 text-sm mt-4 animate-pulse">{progress}</p>
          )}

          {error && (
            <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
          )}
        </form>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '🎨', title: 'Color Palette', desc: 'Extract primary, secondary, and accent colors from CSS' },
          { icon: '🔤', title: 'Typography', desc: 'Discover fonts and Google Fonts used on the site' },
          { icon: '🖼️', title: 'Logo Detection', desc: 'Find logos via OG tags, image analysis, and favicons' },
          { icon: '🧠', title: 'Brand Voice', desc: 'AI-powered personality, tone, and audience analysis' },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition group">
            <span className="text-2xl mb-3 block">{f.icon}</span>
            <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
