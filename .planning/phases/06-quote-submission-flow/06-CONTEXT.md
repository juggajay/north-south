# Phase 06: Quote Submission Flow - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Capture customer intent and configuration, hand off to internal team for manual quote creation. User completes design in configurator, selects optional services (site measure, installation), submits, and receives confirmation. Team reviews submissions in internal queue and creates quotes manually.

</domain>

<decisions>
## Implementation Decisions

### Pre-submit Options
- Site measure: optional toggle with explanation (threshold-based requirement deferred to later)
- Installation quote: same pattern — optional toggle with explanation
- No pricing hints shown for either option — "Team will include pricing in your quote"

### Submission Form
- No contact form needed — user is logged in, use account name/email automatically
- Optional notes field: "Anything else we should know?" for access issues, timeline, special requirements
- Review summary screen shown before final submit button (config + options + notes visible)
- No extra draft logic — design already auto-saved from Phase 04, user can leave and return anytime

### Confirmation Screen
- Success message with timeline: "We'll be in touch within 2-3 business days"
- Summary card showing: design thumbnail, price estimate, selected options
- No confirmation email — wait until team sends actual quote
- Auto-redirect to Orders tab after a few seconds

### Internal Queue (Team Dashboard)
- FIFO sorting by default — oldest submissions first, work through in order received
- Simple 3-step status workflow: New → In Review → Quoted
- Internal notes field per submission — visible only to team for context, follow-up reminders
- Full config breakdown visible: dimensions, all modules with positions, materials, hardware, door profile, price estimate, customer notes

### Claude's Discretion
- Exact toggle UI component styling
- Summary card layout and thumbnail generation
- Auto-redirect timing (2-3 seconds typical)
- Queue table/list layout for team dashboard
- How to display module positions in config breakdown

</decisions>

<specifics>
## Specific Ideas

- User is already logged in (auth required from Phase 04) — leverage existing account data
- Design is already auto-saved — no need for separate "save draft" flow
- Keep submission friction minimal — they've already configured everything in the wizard

</specifics>

<deferred>
## Deferred Ideas

- Site measure threshold logic (require above $X or Y modules) — revisit after launch data
- Confirmation email on submission — evaluate if customers want this
- Priority/urgency flags on submissions — add if queue grows large

</deferred>

---

*Phase: 06-quote-submission-flow*
*Context gathered: 2026-02-04*
