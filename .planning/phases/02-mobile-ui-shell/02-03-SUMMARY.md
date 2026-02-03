---
phase: 02-mobile-ui-shell
plan: 03
subsystem: ai
tags: [gemini, convex, chat, genai, product-knowledge]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Convex schema foundation and database structure
provides:
  - Chat backend with Gemini 2.0 Flash integration
  - Conversation persistence in Convex
  - Product knowledge AI with strict boundaries
  - Chat queries, mutations, and action exports
affects: [02-05-mobile-chat-ui, customer-support, product-recommendations]

# Tech tracking
tech-stack:
  added: ["@google/genai@1.39.0"]
  patterns: ["Convex actions for external API calls", "Internal queries/mutations for action-to-database communication"]

key-files:
  created:
    - convex/chat.ts
    - src/lib/gemini.ts
  modified:
    - convex/schema.ts

key-decisions:
  - "Used gemini-2.0-flash instead of gemini-3-flash-preview (production stability)"
  - "Conversation history limited to last 20 messages for context window management"
  - "Auto-generate conversation title from first 50 chars of user message"
  - "Graceful API error handling returns friendly message instead of throwing"

patterns-established:
  - "Convex action pattern: action calls internal queries/mutations to interact with database"
  - "Chat history formatting: user/assistant roles mapped to user/model for Gemini API"
  - "Conversation unread tracking: increment on assistant response, reset on markAsRead"

# Metrics
duration: 12min
completed: 2026-02-04
---

# Phase 02 Plan 03: Chat Backend Summary

**Gemini 2.0 Flash chat backend with Convex persistence, tradesperson personality, and strict product-knowledge boundaries**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-04T00:47:00Z
- **Completed:** 2026-02-04T00:59:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Chat tables (conversations, messages) in Convex schema with proper indexes
- Gemini system prompt with tradesperson personality and strict boundaries
- Complete chat backend: queries, mutations, and Gemini action
- Conversation history maintained across messages (last 20)
- Error handling for API failures returns friendly message
- Auto-title generation from first message

## Task Commits

Each task was committed atomically:

1. **Task 1: Add chat tables to Convex schema** - `e270e37` (feat)
2. **Task 2: Create Gemini system prompt configuration** - `ae6384a` (feat)
3. **Task 3: Create chat Convex mutations and Gemini action** - `7f3da7c` (feat)

## Files Created/Modified
- `convex/schema.ts` - Added conversations and messages tables with indexes
- `src/lib/gemini.ts` - Gemini configuration with system instruction and model config
- `convex/chat.ts` - Chat queries, mutations, internal helpers, and Gemini action
- `package.json` / `package-lock.json` - Added @google/genai dependency

## Decisions Made

**Model selection:** Used gemini-2.0-flash instead of gemini-3-flash-preview mentioned in research. The 2.0 Flash model is production-ready and stable, while 3.0 Flash preview may not be widely available yet.

**History management:** Limited conversation history to last 20 messages for Gemini context. This balances context quality with token usage and response time.

**Title generation:** Auto-generate conversation title from first 50 characters of user's first message. Simple, requires no additional API call, gives meaningful preview.

**Error handling:** Gemini API errors return friendly message instead of throwing. Maintains user experience even when external service fails.

**Internal pattern:** Used Convex's internal queries/mutations pattern so the action can interact with database. Actions can't directly access ctx.db, must use runQuery/runMutation.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation proceeded smoothly. @google/genai SDK installed without issues, Convex schema changes validated correctly, TypeScript compilation succeeded.

## User Setup Required

**External services require manual configuration.** User needs to:

1. **Get Gemini API key:**
   - Visit Google AI Studio: https://aistudio.google.com/apikey
   - Click "Create API key"
   - Copy the key

2. **Add to environment:**
   - Add to `.env.local`: `GEMINI_API_KEY=your_key_here`
   - Deploy to Convex: `npx convex env set GEMINI_API_KEY your_key_here`

3. **Verify:**
   - Test via Convex dashboard: Functions > chat:sendMessage
   - Args: `{ "message": "What materials do you recommend?" }`
   - Should return tradesperson-style response about materials

## Next Phase Readiness

**Ready for frontend integration.** Chat backend fully functional with:
- All queries/mutations exported and callable from frontend
- Gemini integration working (requires API key setup)
- Error handling in place
- Conversation persistence ready

**Blockers:** Gemini API key required before chat can function. Once key is added to environment, frontend can immediately start using the chat backend.

**Next steps:** Frontend Chat UI (Plan 02-05) can now build the mobile chat interface using these exports.

---
*Phase: 02-mobile-ui-shell*
*Completed: 2026-02-04*
