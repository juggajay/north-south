"use client";

import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

// ============================================================================
// TYPES
// ============================================================================

type Mode = "login" | "register";

// ============================================================================
// ANIMATION
// ============================================================================

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ============================================================================
// SOCIAL LOGIN BUTTONS
// ============================================================================

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.43l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

// ============================================================================
// AUTH PAGE
// ============================================================================

export function LoginPageContent() {
  const [mode, setMode] = useState<Mode>("register");
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white">
        <p className="text-[#616161]">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {/* Back to landing */}
      <header className="flex items-center px-5 h-14 max-w-lg mx-auto w-full">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-[#616161] hover:text-[#232323] transition-colors flex items-center gap-1"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-5 pt-4 pb-8">
        <div className="w-full max-w-[400px]">
          <motion.div
            initial={shouldAnimate ? "hidden" : "visible"}
            animate="visible"
            className="flex flex-col"
          >
            {/* Logo + heading */}
            <motion.div custom={0} variants={fadeUp} className="text-center mb-8">
              <img
                src="/images/nsc-logo.png"
                alt="North South"
                className="h-12 w-auto mx-auto mb-4"
              />
              <h1
                className="text-[1.75rem] leading-tight text-[#232323] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mode === "register"
                  ? "Create your account"
                  : "Welcome back"}
              </h1>
              <p className="text-[15px] text-[#616161]">
                {mode === "register"
                  ? "Start designing your dream space for free."
                  : "Sign in to continue designing."}
              </p>
            </motion.div>

            {/* Social login buttons */}
            <motion.div custom={1} variants={fadeUp} className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => {
                  // TODO: Wire up Google OAuth when credentials are configured
                  alert("Google sign-in coming soon. Please use email & password for now.");
                }}
                className="flex items-center justify-center gap-3 w-full h-[52px] rounded-xl border border-[#E5E5E5] bg-white text-[#232323] text-[15px] font-medium hover:bg-[#FAFAFA] active:bg-[#F5F5F5] transition-colors"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                onClick={() => {
                  // TODO: Wire up Apple OAuth when credentials are configured
                  alert("Apple sign-in coming soon. Please use email & password for now.");
                }}
                className="flex items-center justify-center gap-3 w-full h-[52px] rounded-xl border border-[#E5E5E5] bg-white text-[#232323] text-[15px] font-medium hover:bg-[#FAFAFA] active:bg-[#F5F5F5] transition-colors"
              >
                <AppleIcon />
                Continue with Apple
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div custom={2} variants={fadeUp} className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <span className="text-xs text-[#9E9E9E] uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </motion.div>

            {/* Email/password form */}
            <motion.div custom={3} variants={fadeUp}>
              {mode === "register" ? (
                <RegisterForm onSwitchToLogin={() => setMode("login")} />
              ) : (
                <LoginForm onSwitchToRegister={() => setMode("register")} />
              )}
            </motion.div>

            {/* Privacy line */}
            <motion.p
              custom={4}
              variants={fadeUp}
              className="text-center text-xs text-[#9E9E9E] mt-6"
            >
              We&apos;ll never share your details. No spam, ever.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
