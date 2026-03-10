'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/Navbar';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { UserData } from '@/lib/auth-context';

interface UserRecord extends UserData {
    id: string;
}

function AdminContent() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const snapshot = await getDocs(collection(getDb(), 'users'));
        const userList: UserRecord[] = [];
        snapshot.forEach((doc) => {
            userList.push({ id: doc.id, ...doc.data() } as UserRecord);
        });
        setUsers(userList);
        setLoading(false);
    };

    const changeRole = async (uid: string, newRole: string) => {
        await updateDoc(doc(getDb(), 'users', uid), { role: newRole });
        setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role: newRole as UserData['role'] } : u)));
    };

    const setCredits = async (uid: string, credits: number) => {
        await updateDoc(doc(getDb(), 'users', uid), { credits });
        setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, credits } : u)));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-400 mt-1">{users.length} registered users</p>
                    </div>
                    <div className="px-4 py-2 bg-amber-600/20 text-amber-400 rounded-lg text-sm font-medium">
                        🛡️ Admin Access
                    </div>
                </div>

                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Email</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Role</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Credits</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                    <td className="px-6 py-4 text-white text-sm">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={u.role}
                                            onChange={(e) => changeRole(u.id, e.target.value)}
                                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="pro">Pro</option>
                                            <option value="free">Free</option>
                                            <option value="guest">Guest</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={u.credits}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setUsers((prev) => prev.map((user) => (user.id === u.id ? { ...user, credits: val } : user)));
                                            }}
                                            onBlur={(e) => setCredits(u.id, parseInt(e.target.value) || 0)}
                                            className="w-24 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-amber-600/20 text-amber-400' :
                                            u.role === 'pro' ? 'bg-indigo-600/20 text-indigo-400' :
                                                u.role === 'free' ? 'bg-emerald-600/20 text-emerald-400' :
                                                    'bg-gray-600/20 text-gray-400'
                                            }`}>
                                            {u.role === 'admin' ? '🛡️' : u.role === 'pro' ? '⭐' : u.role === 'free' ? '🟢' : '👻'}
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminContent />
        </ProtectedRoute>
    );
}
