"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ChatInterface = dynamic(
  () => import("@/components/chat/ChatInterface").then((mod) => ({ default: mod.ChatInterface })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-500">Loading chat...</p>
      </div>
    ),
  }
);

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col pb-20">
      <ChatInterface />
    </div>
  );
}
