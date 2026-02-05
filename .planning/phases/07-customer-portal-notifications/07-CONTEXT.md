# Phase 07: Customer Portal & Notifications - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Post-purchase customer experience: order status visibility, document access, QR panel lookup, and proactive email notifications at key milestones. The portal is read-only for customers — team uploads content via admin (Phase 08). Referral program tracking and chat access are included. Production photo gallery and installation guides remain in scope per roadmap.

</domain>

<decisions>
## Implementation Decisions

### Order Timeline
- Vertical stepper layout, linear steps down the page
- Completed steps show checkmark + timestamp only (no notes or rich content)
- Current/active milestone shows as expanded card with more detail
- Future milestones show sequence without estimated dates

### Document Access
- Download only — tap to download PDF, no in-app preview
- Full version history visible (Quote v1, Quote v2 revised, etc.)
- Organized by document type: separate sections for Quotes and Invoices
- MVP document types: Quote + Invoice only (specs and care guides deferred)

### QR Panel Lookup
- Basic panel info only: panel name, dimensions, material, finish
- Public access — no login required (useful for installers, family helping)
- Minimal page — no chat/support links, just panel info
- Product card style — friendly card with material swatch image

### Email Notifications
- Balanced tone: professional but approachable, with tradesperson authenticity
- Text only — no embedded images, clean and fast-loading
- Brief updates: status change + one line context + link to portal (2-3 sentences)
- Post-install email includes clear CTA to leave a Google/social review

### Claude's Discretion
- Exact stepper component styling
- Email subject line wording
- Document list item design
- Loading states and empty states

</decisions>

<specifics>
## Specific Ideas

- Email tone should blend professional/formal with tradesperson authenticity — not stiff, not too casual
- Review request in post-install email should be clear CTA, not buried

</specifics>

<deferred>
## Deferred Ideas

- Production specification PDF in documents — keep for Phase 08 (production specs are admin-generated)
- Care & Maintenance guide document type — add to backlog
- Assembly context in QR lookup — could enhance later
- Estimated dates on future milestones — requires team workflow integration

</deferred>

---

*Phase: 07-customer-portal-notifications*
*Context gathered: 2026-02-05*
