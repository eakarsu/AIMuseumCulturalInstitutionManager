# Governed museum operations

The supported boundary is `/api/governed-operations`: validated, provenance-cleared object loans and consent-scoped visitor experiences. Generated CRUD, autonomous/provider, visitor-agent, and gap routes remain unmounted pending provenance review.

Loan requests require ownership authority, provenance decision, facility acceptance, condition digest, insurance, dates, climate-controlled transport, and security escort. Registrar and conservator approvals are distinct; creators cannot approve. Consequential custody transitions require ready typed adapters and fresh condition evidence. External work enters an outbox with retry/dead-letter records; closeout requires return-condition and custody receipts. Events are database-enforced append-only.

Visitor personalization accepts only explicit interests, accessibility, and language consent, prohibits sensitive/protected traits, expires and revokes consent with profile erasure, versions the catalog, produces deterministic explanations, and remains a draft until human approval. It never autonomously changes ticketing, CRM, or visitor access.

Lifecycle: run `scripts/bootstrap.sh` for lockfiles; review/backup then explicitly run `ALLOW_SCHEMA_MUTATION=yes scripts/migrate.sh`; optionally use the production-disabled seed; then `start.sh`. Startup never installs, starts PostgreSQL, creates/migrates/seeds a database, or kills occupied ports.

Provider credentials/contracts, provenance and ownership decisions, conservation/insurance/security approvals, shipping reconciliation, privacy impact assessment, accessibility/user testing, historical acceptance fixtures, migration/restore rehearsals, and qualified museum/legal/privacy/security validation remain external gates.
