# ExecPlan: Discord Gateway n8n Bootstrap

**Status:** Completed
**Author:** Codex
**Created:** 2026-02-25
**Last Updated:** 2026-02-25

## Purpose / Big Picture

Establish a production-ready project baseline for a Discord Gateway bot that triggers local n8n workflows from slash commands. After this change, operators can define commands in repository config, run the service on an outbound-only OCI host, and execute mapped workflows without exposing inbound endpoints.

## Context and Orientation

The repository started as documentation scaffolding with no runtime bot implementation. Key additions in this plan:

- Runtime code in `src/` following layered architecture (`types -> config -> repo -> service -> runtime`).
- Workflow configuration model in `config/workflows.example.json`.
- Project scripts/tooling in `package.json` and `tsconfig.json`.
- Documentation updates across architecture, design docs, product specs, and AGENTS map.

Non-obvious term: "outbound-only" means the host can initiate requests but cannot accept unsolicited inbound internet traffic.

## Plan of Work

1. Create TypeScript runtime and module boundaries.
2. Implement Discord command registration and gateway interaction handling.
3. Implement local n8n webhook invocation with timeout + optional auth header support.
4. Add schema validation for env and workflow config boundaries.
5. Add baseline unit tests for schema and mapping behavior.
6. Update docs and indices to document architecture and operational setup.

## Progress

- [x] 2026-02-25T03:10Z - Added TypeScript project scaffolding and scripts.
- [x] 2026-02-25T03:14Z - Implemented config schemas, Discord command sync, and gateway runtime.
- [x] 2026-02-25T03:16Z - Added n8n client integration and payload mapping.
- [x] 2026-02-25T03:18Z - Added unit tests for env/schema/command mapping.
- [x] 2026-02-25T03:23Z - Updated architecture/design/spec/docs indexes and AGENTS quick-start commands.
- [x] 2026-02-25T03:27Z - Ran local validation commands and captured outcomes.
- [x] 2026-02-25T03:30Z - Confirmed `pnpm build`, `pnpm test`, and `pnpm check` pass.

## Surprises & Discoveries

- The repository had no runtime code and only template docs, so architecture docs had to be concretized while implementing.
- OCI network constraint reinforced the choice to avoid inbound listeners and rely solely on Discord gateway + local n8n calls.
- `harness` CLI is not installed in this environment (`harness: command not found`), so only project-local checks were executable.

## Decision Log

- **Decision:** Use config-driven slash command definitions via `config/workflows.json`.
  **Rationale:** Enables adding workflows without code changes and keeps behavior legible to agents.
  **Date/Author:** 2026-02-25 / Codex

- **Decision:** Sync commands at startup with optional guild scope (`DISCORD_GUILD_ID`).
  **Rationale:** Guild scope provides instant propagation during development; global commands remain available for production.
  **Date/Author:** 2026-02-25 / Codex

- **Decision:** Validate boundaries with zod (`env`, workflow config).
  **Rationale:** Enforces Golden Rule #2 and provides actionable startup errors.
  **Date/Author:** 2026-02-25 / Codex

## Outcomes & Retrospective

The project now includes a working, layered implementation for Discord slash commands triggering n8n workflows locally. Documentation was updated to reflect both architecture and operational constraints. Remaining setup work is environment-specific: install dependencies, provision bot credentials, and define `config/workflows.json` for real workflows.
