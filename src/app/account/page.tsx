"use client";

import { FormEvent, useEffect, useState } from "react";

type ProfileResponse = {
  user?: {
    email: string;
    role: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
};

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const data = (await response.json()) as ProfileResponse;

        if (!response.ok || !data.user) {
          return;
        }

        setEmail(data.user.email);
        setRole(data.user.role);
        setFullName(data.user.fullName ?? "");
        setAvatarUrl(data.user.avatarUrl ?? "");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          avatarUrl,
        }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setMessage(data.error ?? "Unable to update profile.");
        return;
      }

      setMessage(data.message ?? "Profile updated.");
    } catch {
      setMessage("Unexpected error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background-light text-primary p-6 md:p-10">
      <div className="max-w-2xl mx-auto bg-white border border-primary/10 p-8 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary/50 mb-3">Account</p>
        <h1 className="text-3xl md:text-4xl mb-8">Update Profile</h1>

        {loading ? (
          <p className="text-primary/70">Loading profile...</p>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-primary/50 mb-2">Email</label>
              <input className="w-full border border-primary/20 px-4 py-3 bg-slate-50" disabled value={email} />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-primary/50 mb-2">Role</label>
              <input className="w-full border border-primary/20 px-4 py-3 bg-slate-50" disabled value={role} />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-primary/50 mb-2">Full Name</label>
              <input
                className="w-full border border-primary/20 px-4 py-3"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                value={fullName}
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-primary/50 mb-2">Avatar URL</label>
              <input
                className="w-full border border-primary/20 px-4 py-3"
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
                value={avatarUrl}
              />
            </div>

            {message && <p className="text-sm text-primary/80">{message}</p>}

            <button
              className="bg-primary text-white px-8 py-3 text-[11px] tracking-widest uppercase font-semibold disabled:opacity-70"
              disabled={saving}
              type="submit"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
