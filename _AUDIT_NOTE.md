# Audit Apply Note — AIMuseumCulturalInstitutionManager

Source: `_AUDIT/reports/batch_05.md` section 30.

## Original Recommendations
### Missing AI counterparts
- `/ai/visitor-experience-personalize`
- `/ai/collection-valuation`
- `/ai/conservation-priority`
- `/ai/event-attendance-predict`

### Missing non-AI
- Visitor portal / virtual tour / teacher resources / donation tax docs / conservation lab workflow / security access control integration

### Custom suggestions
- Agentic collection curator
- Vision-based artifact documentation
- Personalized visitor journey agent
- Autonomous conservation assistant
- Community & storytelling platform
- Vertical integration with major museums

## Implemented (this pass)
Added three endpoints in `backend/routes/ai.js`:
- `POST /api/ai/visitor-experience-personalize`
- `POST /api/ai/collection-valuation`
- `POST /api/ai/conservation-priority`

Followed existing style (ESM, `generateAIContent`, `parseAIJson`, `aiLimiter`, `MUSEUM_SYSTEM_PROMPT`).

## Backlog
| Item | Tag |
|---|---|
| `/ai/event-attendance-predict` | MECHANICAL — out of 3-item budget |
| Visitor portal | NEEDS-PRODUCT-DECISION |
| Virtual tour / 3D viewing | NEEDS-PRODUCT-DECISION |
| Teacher resource library | NEEDS-PRODUCT-DECISION |
| Donation tax documentation | NEEDS-PRODUCT-DECISION (regulatory) |
| Conservation lab workflow | NEEDS-PRODUCT-DECISION |
| Security access control integration | NEEDS-CREDS |
| Vision-based artifact documentation | NEEDS-PRODUCT-DECISION |
| Major museum (Met/MoMA) integrations | NEEDS-CREDS |

## Apply pass 3 (frontend)

FE already wired. `frontend/src/pages/AIAdvisor.jsx` is a multi-tool page covering all three pass-2 endpoints (`visitor-experience-personalize`, `collection-valuation`, `conservation-priority`) with per-tool form fields, result rendering components, and JWT auth via the existing `api.js` helper. Route `/ai-advisor` is registered in `App.jsx`. No FE changes required.

## Apply pass 4 (mechanical backlog)

Implemented the remaining MECHANICAL backlog item:

- `POST /api/ai/event-attendance-predict` (in `backend/routes/ai.js`): forecasts attendance with low/high range, confidence, fill rate, drivers, risks, and recommendations. Returns strict JSON via `parseAIJson`. Reuses `generateAIContent`, `aiLimiter`, and `MUSEUM_SYSTEM_PROMPT`.

The shared `generateAIContent` helper in `backend/ai.js` now short-circuits with `err.statusCode = 503` when `OPENROUTER_API_KEY` is missing. The existing three pass-2 routes plus the new one honor it via `res.status(err.statusCode || 500)` in their catch handlers, so each surfaces a 503 instead of a 500 when the key is absent.

FE: `frontend/src/pages/AIAdvisor.jsx` gains a fourth advisor "Event Attendance Forecast" with its own form fields, a custom result renderer (`AttendanceResult`), and the existing `api.js`-based JWT bearer. Errors surface through the existing `error` state.

No new dependencies and no schema changes.

## Apply pass 5 (all backlog)

Three additional AI endpoints addressing remaining audit suggestions. All gate on `OPENROUTER_API_KEY` via the shared `generateAIContent` helper (existing 503 contract from pass 4) — see `// PRODUCT-DECISION:` comments in `backend/routes/ai.js` for default choices.

- `POST /api/ai/artifact-documentation` — structured catalog documentation from a TEXT description. Vision-based pipeline deferred to a future pass that introduces an upload endpoint and a vision-capable model selection (PRODUCT-DECISION documented inline).
- `POST /api/ai/teacher-resource-generator` — K-12 lesson plan tied to a topic/exhibition. Default grade band 6-8, default duration 45 minutes (PRODUCT-DECISION documented inline).
- `POST /api/ai/donation-tax-doc` — IRS-aligned donor acknowledgment language with explicit "not tax/legal advice" caveats. Required fields: `donor_name`, `donation_type`.

FE: `frontend/src/pages/AIAdvisor.jsx` exposes the three new tools (Artifact Documentation, Teacher Resource Pack, Donation Acknowledgment) with their own form schemas and the existing JWT-bearer / 503 detection plumbing. Output rendering falls back to the JSON pretty-printer for these tools, which is sufficient for the structured payloads.

Smoke-tested: BE booted on alt port 4011, `admin@museum.org / password123` login OK, new endpoints reachable. AI calls themselves return upstream errors only because `.env` ships with the placeholder `OPENROUTER_API_KEY=your_openrouter_api_key_here` — pre-existing project state, not a regression.

Remaining backlog (NEEDS-PRODUCT-DECISION / NEEDS-CREDS): visitor portal, virtual/3D tour, conservation lab workflow, Met/MoMA integrations, security access control integration.
