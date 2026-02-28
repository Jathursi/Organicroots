"use client";

import { useEffect, useState, useMemo } from "react";

type RoleAccess = {
    label: string;
    badgeClass: string;
    access: string;
};

const ROLES: Record<string, RoleAccess> = {
    super_admin: { label: "Super Admin", badgeClass: "bg-black text-white ring-2 ring-black/20", access: "Total System Control" },
    admin: { label: "Administrator", badgeClass: "bg-[#03045e] text-white", access: "Full Console Access" },
    user: { label: "Customer", badgeClass: "bg-slate-100 text-slate-600", access: "Limited Dashboard Access" },
};

type UserData = {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    lastActive: string | null;
    profile: { avatarUrl: string | null } | null;
};

export default function TeamManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        role: "user",
        password: ""
    });

    const fetchUsers = async () => {
        try {
            const resp = await fetch("/api/admin/users");
            const data = await resp.json();
            if (resp.ok) {
                setUsers(data.users);
            } else {
                setError(data.error || "Failed to fetch users");
            }
        } catch (err) {
            setError("Network error fetching team");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const hasSuperAdmin = useMemo(() => {
        return users.some(u => u.role === "super_admin");
    }, [users]);

    const handleOpenPanel = (user?: UserData) => {
        if (user) {
            setEditingUserId(user.id);
            setFormData({
                fullName: user.fullName || "",
                email: user.email,
                role: user.role,
                password: ""
            });
        } else {
            setEditingUserId(null);
            setFormData({ fullName: "", email: "", role: "user", password: "" });
        }
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setError(null);
        setEditingUserId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const url = editingUserId ? `/api/admin/users/${editingUserId}` : "/api/admin/users";
            const method = editingUserId ? "PUT" : "POST";
            const payload = { ...formData };
            if (editingUserId && !payload.password) {
                delete (payload as any).password;
            }

            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await resp.json();

            if (resp.ok) {
                fetchUsers();
                handleClosePanel();
            } else {
                setError(data.error || `Failed to ${editingUserId ? 'update' : 'create'} user`);
            }
        } catch (err) {
            setError(`Network error ${editingUserId ? 'updating' : 'creating'} user`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!editingUserId || !confirm("Are you sure you want to delete this user?")) return;

        setSubmitting(true);
        try {
            const resp = await fetch(`/api/admin/users/${editingUserId}`, {
                method: "DELETE",
            });
            if (resp.ok) {
                fetchUsers();
                handleClosePanel();
            } else {
                const data = await resp.json();
                setError(data.error || "Failed to delete user");
            }
        } catch (err) {
            setError("Network error deleting user");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Never";
        const d = new Date(dateStr);
        return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-4xl font-serif text-[#03045e] italic">Team & Role Management</h2>
                        <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] mt-2 font-medium">Manage administrative access and assign permission levels</p>
                    </div>
                    <button
                        onClick={() => handleOpenPanel()}
                        className="bg-[#03045e] text-white hover:bg-black px-8 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#03045e]/10"
                    >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        Add New User
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex justify-between items-center transition-all animate-in slide-in-from-top-4">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="material-symbols-outlined text-sm">close</button>
                    </div>
                )}

                <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-left">Admin Profile</th>
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-left">Current Role</th>
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-left">Access Level</th>
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-left">Last Active</th>
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-400 uppercase tracking-widest text-xs">Loading Team...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-400 uppercase tracking-widest text-xs">No team members found.</td></tr>
                                ) : users.map((u) => {
                                    const roleCfg = ROLES[u.role] || ROLES.user;
                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-5 px-6 border-b border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-[#03045e] font-bold overflow-hidden border border-slate-100 ring-2 ring-slate-50">
                                                        {u.profile?.avatarUrl ? (
                                                            <img alt={u.fullName || "User"} className="w-full h-full object-cover" src={u.profile.avatarUrl} />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-slate-300">person</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{u.fullName || "Legacy User"}</p>
                                                        <p className="text-[10px] text-slate-400 tracking-wide font-medium lowercase">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 border-b border-slate-50">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${roleCfg.badgeClass}`}>
                                                    {roleCfg.label}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 border-b border-slate-50">
                                                <span className="text-xs text-slate-500 italic">{roleCfg.access}</span>
                                            </td>
                                            <td className="py-5 px-6 border-b border-slate-50">
                                                <p className="text-xs text-slate-600 font-medium">{formatDate(u.lastActive)}</p>
                                                <p className="text-[9px] text-slate-400 uppercase tracking-tighter mt-0.5">
                                                    {u.lastActive && new Date(u.lastActive).getTime() > Date.now() - 300000 ? "Active Now" : "Logged in recently"}
                                                </p>
                                            </td>
                                            <td className="py-5 px-6 border-b border-slate-50 text-right">
                                                <button
                                                    onClick={() => handleOpenPanel(u)}
                                                    className="text-[10px] font-bold tracking-widest uppercase text-[#03045e] hover:underline flex items-center gap-1 ml-auto group/btn transition-all"
                                                >
                                                    Manage
                                                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-0.5 transition-transform">expand_more</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Showing {users.length} Administrative Users</p>
                        <div className="flex gap-2">
                            <button disabled className="px-3 py-1 border border-slate-100 text-slate-300"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                            <button className="px-3 py-1 bg-[#03045e] text-white text-[10px] font-bold shadow-sm">1</button>
                            <button disabled className="px-3 py-1 border border-slate-100 text-slate-300"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Side Panel Overlay */}
            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity"
                    onClick={handleClosePanel}
                />
            )}

            {/* Side Panel */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-[60] border-l border-slate-100 transition-transform duration-500 transform ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/50">
                    <h3 className="text-xl font-serif italic text-[#03045e]">{editingUserId ? 'Edit Account Profile' : 'Add New Team Member'}</h3>
                    <button
                        onClick={handleClosePanel}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <span className="material-symbols-outlined font-light">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-160px)]">
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Full Name</label>
                            <input
                                required
                                className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-[#03045e]/20 focus:border-[#03045e] text-xl font-serif italic p-3 outline-none transition-all placeholder:text-slate-200"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                placeholder="Julian de'Rossi"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Email Address</label>
                            <input
                                required
                                className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-[#03045e]/20 focus:border-[#03045e] text-sm p-3 outline-none transition-all"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="example@organicroots.com"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">{editingUserId ? 'Reset Password (optional)' : 'Password'}</label>
                            <input
                                required={!editingUserId}
                                className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-[#03045e]/20 focus:border-[#03045e] text-sm p-3 outline-none transition-all"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder={editingUserId ? "Leave blank to keep current" : "••••••••"}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-4">Permission Role</label>
                            <div className="grid gap-4">
                                {Object.entries(ROLES)
                                    .filter(([key]) => {
                                        // Hide super_admin option if one already exists, except when we are specifically editing that super admin
                                        if (key === "super_admin" && hasSuperAdmin) {
                                            const currentIsSuper = users.find(u => u.id === editingUserId)?.role === "super_admin";
                                            return currentIsSuper;
                                        }
                                        return true;
                                    })
                                    .map(([key, role]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, role: key }))}
                                            className={`flex items-center gap-4 p-5 border transition-all rounded-xl text-left ${formData.role === key
                                                ? (key === "super_admin" ? "border-black bg-black/5 ring-1 ring-black shadow-sm" : "border-[#03045e] bg-[#03045e]/5 shadow-sm")
                                                : "border-slate-100 bg-white hover:border-slate-200"
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined text-3xl ${formData.role === key ? (key === 'super_admin' ? 'text-black' : 'text-[#03045e]') : "text-slate-300"}`}>
                                                {key === 'super_admin' ? 'stars' : (key === 'admin' ? 'admin_panel_settings' : 'person')}
                                            </span>
                                            <div className="flex-1">
                                                <p className={`text-[11px] font-bold uppercase tracking-wider ${formData.role === key ? (key === 'super_admin' ? 'text-black' : 'text-[#03045e]') : "text-slate-600"}`}>
                                                    {role.label}
                                                </p>
                                                <p className="text-[9px] text-slate-400 mt-1 leading-tight">{role.access}</p>
                                            </div>
                                            {formData.role === key && (
                                                <span className={`material-symbols-outlined ${key === 'super_admin' ? 'text-black' : 'text-[#03045e]'}`}>check_circle</span>
                                            )}
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {editingUserId && (
                            <div className="pt-6 border-t border-slate-50">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-red-50"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    Deactivate User
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t border-slate-100 flex gap-4">
                        <button
                            type="button"
                            onClick={handleClosePanel}
                            className="flex-1 px-4 py-4 text-[10px] font-bold tracking-widest uppercase border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all duration-300"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 px-4 py-4 text-[10px] font-bold tracking-widest uppercase text-white transition-all duration-300 disabled:opacity-50 ${formData.role === 'super_admin' ? 'bg-black hover:bg-gray-900' : 'bg-[#03045e] hover:bg-black'
                                }`}
                        >
                            {submitting ? "Processing..." : (editingUserId ? "Update Profile" : "Create Account")}
                        </button>
                    </div>
                </form>
            </div>

            <footer className="pt-20 pb-10 text-center">
                <p className="text-[9px] uppercase tracking-[0.5em] text-slate-300">ORGANICROOTS Administrative Ecosystem v4.2.0 | © 2024</p>
            </footer>
        </div>
    );
}
