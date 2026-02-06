"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { signIn } = useAuthActions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signIn("password", {
        email,
        password,
        name,
        flow: "signUp",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-name" className="text-sm font-medium text-[#232323]">
            What should we call you?
          </label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah"
            required
            autoComplete="name"
            disabled={loading}
            className="h-[52px] w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#232323] placeholder:text-[#BDBDBD] outline-none transition-colors focus:border-[#77BC40] focus:ring-2 focus:ring-[#77BC40]/20 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-email" className="text-sm font-medium text-[#232323]">
            Email
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className="text-sm font-medium text-[#232323]">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={loading}
            className="h-[52px] w-full rounded-xl border border-[#E5E5E5] bg-white px-4 text-[15px] text-[#232323] placeholder:text-[#BDBDBD] outline-none transition-colors focus:border-[#77BC40] focus:ring-2 focus:ring-[#77BC40]/20 disabled:opacity-50"
          />
          <p className="text-xs text-[#9E9E9E]">Minimum 8 characters</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="register-confirm" className="text-sm font-medium text-[#232323]">
            Confirm password
          </label>
          <input
            id="register-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
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
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-center text-sm text-[#616161]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={loading}
          className="text-[#232323] font-medium hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
