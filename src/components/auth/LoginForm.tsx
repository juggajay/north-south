"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn("password", {
        email,
        password,
        flow: "signIn",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-[#232323]">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@email.com"
            required
            autoComplete="email"
            disabled={loading}
            className="h-[52px] w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#232323] placeholder:text-[#BDBDBD] outline-none transition-colors focus:border-[#77BC40] focus:ring-2 focus:ring-[#77BC40]/20 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="text-sm font-medium text-[#232323]">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            disabled={loading}
            className="h-[52px] w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#232323] placeholder:text-[#BDBDBD] outline-none transition-colors focus:border-[#77BC40] focus:ring-2 focus:ring-[#77BC40]/20 disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 p-3 bg-red-50 rounded-xl" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-[52px] rounded-xl bg-[#232323] text-white text-[15px] font-semibold hover:bg-[#2D2D2D] active:bg-[#1a1a1a] transition-colors disabled:opacity-50 shadow-lg shadow-[#232323]/10"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-[#616161]">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          disabled={loading}
          className="text-[#232323] font-medium hover:underline"
        >
          Create account
        </button>
      </p>
    </form>
  );
}
