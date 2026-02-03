"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { AlertCircle } from "lucide-react";

export function ChatInterface() {
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = useAction(api.chat.sendMessage);
  const markAsRead = useMutation(api.chat.markAsRead);

  // Load conversation ID from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem("chatConversationId");
    if (savedId) {
      setConversationId(savedId as Id<"conversations">);
    }
  }, []);

  // Get conversation messages
  const conversation = useQuery(
    api.chat.getConversation,
    conversationId ? { conversationId } : "skip"
  );

  const messages = conversation?.messages || [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Mark conversation as read when component mounts or conversationId changes
  useEffect(() => {
    if (conversationId) {
      markAsRead({ conversationId }).catch((err) => {
        console.error("Failed to mark conversation as read:", err);
      });
    }
  }, [conversationId, markAsRead]);

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendMessage({
        conversationId: conversationId || undefined,
        message,
        userId: undefined, // TODO: Wire up actual user ID when auth is ready
      });

      // Save conversation ID if this was the first message
      if (result.conversationId && !conversationId) {
        setConversationId(result.conversationId);
        localStorage.setItem("chatConversationId", result.conversationId);
      }

      // Check if there was an error in the response
      if (result.error) {
        setError("Failed to get response. Please try again.");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          AI Assistant
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Ask about materials, hardware, or cabinetry
        </p>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Ask me anything about materials, hardware, or cabinetry.
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                I can help with Polytec finishes, Blum hardware, joinery options, and more.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg._id}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
                timestamp={msg.createdAt}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="border-t border-zinc-200 bg-amber-50 px-4 py-3 dark:border-zinc-800 dark:bg-amber-950/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="flex-1">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="mt-1 text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder="Ask about materials, hardware, or design..."
      />
    </div>
  );
}
