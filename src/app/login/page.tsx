"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, fullName: fullName.trim() || null };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        user?: { role?: string };
      };

      if (!response.ok) {
        setError(data.error ?? "Request failed.");
        return;
      }

      setSuccess(data.message ?? (mode === "login" ? "Login successful." : "Registration successful."));

      if (mode === "login") {
        if (data.user?.role === "admin") {
          router.push("/admin");
          return;
        }

        router.push("/");
        return;
      }

      if (mode === "register") {
        router.push("/");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white overflow-hidden">
      <div className="hidden lg:block w-1/2 relative">
        <Image
          alt="Fresh dew-covered organic vegetables"
          className="absolute inset-0 w-full h-full object-cover"
          fill
          priority
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_7_yr7tYKRtKS06sDwd0-DifqQTWayVVe76V6ScP-sOmyw5uUpG_Sp7KpnRELZ8Tv3GcQnR-goYxdRfFPQKuYX0VBq9W9HWo-RxcmkSlri6g1TS0JmO-e3bCwXsVGwafzuhnX0Jda7NajpcMSROHldOA6EqHa6V5XgOzg14qy33i1vUeUFbIaBY7UB-vjG56Bhmh8gtBSTn653UZDhMHMMkIJV4JlFllwNioKARwxpIFLO2TUZxWLR4DfllRpcqyV5tAePXSOo89g"
        />
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
        <div className="absolute bottom-16 left-16 max-w-md text-white">
          <p className="text-[10px] tracking-[0.4em] uppercase mb-4 opacity-80">The Harvest Standard</p>
          <h2 className="text-4xl italic leading-tight">Curated nature, delivered to your residence.</h2>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-between p-12 md:p-24 relative">
        <div className="w-full flex justify-center lg:justify-start">
          <Link className="text-2xl tracking-tight text-primary uppercase font-serif" href="/">
            ORGANIC<span className="font-light italic">ROOTS</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-12">
            <h1 className="text-5xl font-light mb-4 text-primary">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-slate-500 font-light text-sm">
              {mode === "login"
                ? "Enter your credentials to access your curated list."
                : "Register to start your Organic Roots experience."}
            </p>
          </div>

          <div className="flex gap-2 mb-8 border border-light-cyan p-1 text-[11px] tracking-widest uppercase">
            <button
              className={`flex-1 py-3 transition-colors ${mode === "login" ? "bg-primary text-white" : "text-primary"}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 transition-colors ${mode === "register" ? "bg-primary text-white" : "text-primary"}`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-slate-200 px-0 py-4 focus:ring-0 focus:border-primary transition-colors text-sm font-light placeholder:text-slate-300"
                  id="fullName"
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  type="text"
                  value={fullName}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-slate-200 px-0 py-4 focus:ring-0 focus:border-primary transition-colors text-sm font-light placeholder:text-slate-300"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-semibold" htmlFor="password">
                  Password
                </label>
                {mode === "login" && (
                  <span className="text-[10px] uppercase tracking-widest text-primary/60">Secure Login</span>
                )}
              </div>
              <input
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-slate-200 px-0 py-4 focus:ring-0 focus:border-primary transition-colors text-sm font-light placeholder:text-slate-300"
                id="password"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-700">{success}</p>}

            <div className="pt-4">
              <button
                className="w-full bg-primary text-white py-5 text-[11px] font-bold tracking-widest-extra uppercase hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/10 disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
              </button>
            </div>
          </form>
        </div>

        <div className="w-full text-center lg:text-left">
          <p className="text-[11px] tracking-widest uppercase text-slate-400 font-light">
            {mode === "login" ? "New to OrganicRoots?" : "Already have an account?"}
            <button
              className="text-primary font-bold ml-1 hover:underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              type="button"
            >
              {mode === "login" ? "Create an Account" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
