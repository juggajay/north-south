import { GoogleGenAI } from "@google/genai";
import {
  action,
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { SYSTEM_INSTRUCTION, GEMINI_CONFIG } from "../src/lib/gemini";
import { internal } from "./_generated/api";

// ===================
// QUERIES
// ===================

export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    return {
      ...conversation,
      messages,
    };
  },
});

export const listConversations = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const conversations = args.userId
      ? await ctx.db
          .query("conversations")
          .withIndex("by_userId", (q) => q.eq("userId", args.userId))
          .order("desc")
          .collect()
      : await ctx.db.query("conversations").order("desc").collect();

    return conversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const getUnreadCount = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) =>
        args.userId ? q.eq("userId", args.userId) : q
      )
      .collect();

    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  },
});

// ===================
// MUTATIONS
// ===================

export const createConversation = mutation({
  args: {
    userId: v.optional(v.id("users")),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      userId: args.userId,
      title: args.title,
      lastMessageAt: Date.now(),
      unreadCount: 0,
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      unreadCount: 0,
    });
  },
});

// ===================
// INTERNAL HELPERS (for action to call)
// ===================

export const internal_getHistory = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(20);

    return messages.reverse(); // Return chronological order for Gemini
  },
});

export const internal_storeMessages = internalMutation({
  args: {
    conversationId: v.optional(v.id("conversations")),
    userId: v.optional(v.id("users")),
    userMessage: v.string(),
    assistantMessage: v.string(),
  },
  handler: async (ctx, args) => {
    let conversationId = args.conversationId;

    // Create conversation if it doesn't exist
    if (!conversationId) {
      // Generate title from first message (first 50 chars)
      const title = args.userMessage.substring(0, 50);

      conversationId = await ctx.db.insert("conversations", {
        userId: args.userId,
        title: title + (args.userMessage.length > 50 ? "..." : ""),
        lastMessageAt: Date.now(),
        unreadCount: 1, // New conversation has 1 unread (the response)
        createdAt: Date.now(),
      });
    } else {
      // Update existing conversation
      await ctx.db.patch(conversationId, {
        lastMessageAt: Date.now(),
        unreadCount: (await ctx.db.get(conversationId))!.unreadCount + 1,
      });
    }

    const now = Date.now();

    // Store user message
    await ctx.db.insert("messages", {
      conversationId,
      role: "user",
      content: args.userMessage,
      createdAt: now,
    });

    // Store assistant message
    await ctx.db.insert("messages", {
      conversationId,
      role: "assistant",
      content: args.assistantMessage,
      createdAt: now + 1, // Slightly later to maintain order
    });

    return conversationId;
  },
});

// ===================
// ACTION (Gemini API call)
// ===================

export const sendMessage = action({
  args: {
    conversationId: v.optional(v.id("conversations")),
    message: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args): Promise<{ conversationId: Id<"conversations"> | null; response: string; error?: boolean }> => {
    try {
      // Initialize Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Get conversation history if existing conversation
      const history = args.conversationId
        ? await ctx.runQuery(internal.chat.internal_getHistory, {
            conversationId: args.conversationId,
          })
        : [];

      // Format history for Gemini
      const formattedHistory = history.map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      // Create chat session
      const chat = ai.chats.create({
        model: GEMINI_CONFIG.model,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: GEMINI_CONFIG.temperature,
        },
        history: formattedHistory,
      });

      // Send message
      const response = await chat.sendMessage({ message: args.message });
      const assistantMessage = response.text || "I'm having trouble responding right now.";

      // Store both messages
      const conversationId = await ctx.runMutation(
        internal.chat.internal_storeMessages,
        {
          conversationId: args.conversationId,
          userId: args.userId,
          userMessage: args.message,
          assistantMessage,
        }
      );

      return {
        conversationId,
        response: assistantMessage,
      };
    } catch (error) {
      console.error("Gemini API error:", error);

      // Return friendly error message
      return {
        conversationId: args.conversationId || null,
        response:
          "I'm having trouble connecting right now. Please try again in a moment.",
        error: true,
      };
    }
  },
});
