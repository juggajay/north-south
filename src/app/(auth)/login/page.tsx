"use client";

import dynamic from "next/dynamic";

const LoginPageContent = dynamic(
  () => import("@/components/auth/LoginPageContent").then((mod) => ({ default: mod.LoginPageContent })),
  { ssr: false }
);

export default function LoginPage() {
  return <LoginPageContent />;
}
