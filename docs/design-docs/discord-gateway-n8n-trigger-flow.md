# Design Doc: Discord Gateway to n8n Trigger Flow

**Status:** Implemented
**Author:** Codex
**Date:** 2026-02-25

## Problem Statement

We need a Discord bot that can execute selected n8n workflows via slash commands, while running on an Oracle Cloud instance that does not allow inbound network traffic. The integration must remain reliable, secure by default, and easy to extend as new workflows are added.

## Goals

- Support slash-command-driven workflow triggers from Discord.
- Run without inbound ports by relying on Discord Gateway + REST outbound traffic only.
- Keep workflow command definitions in repository data (`config/workflows.json`) instead of code edits.
- Validate all edge inputs (environment variables and workflow config schema).
- Return clear success/failure output to Discord users.

## Non-Goals

- Building a Discord UI beyond slash commands.
- Managing workflow lifecycle inside n8n.
- Exposing n8n publicly or adding reverse-proxy ingress.
- Implementing persistent storage for command execution history.

## Proposed Solution

Implement a layered TypeScript service:

1. Load and validate environment config (`src/config/env.ts`) and workflow config JSON (`src/config/workflows.ts`).
2. Convert workflow definitions into Discord command specs (`buildDiscordCommands`) and sync via Discord REST on startup.
3. Start a Discord Gateway client and listen for chat-input command interactions.
4. For each interaction, build a normalized payload with user/context metadata and typed option inputs.
5. POST payload to local n8n webhook path (`N8N_BASE_URL + webhookPath`) using `N8nClient` with timeout + optional auth header.
6. Reply to Discord interaction ephemerally with success/failure details.

## Alternatives Considered

- **Discord outgoing webhooks + local HTTP listener**: rejected because OCI ingress is blocked.
- **Hardcoded commands in TypeScript**: rejected because each workflow addition would require a deployment.
- **Single generic `/workflow` command with free-form JSON input**: rejected for poorer UX and weaker option typing.

## Dependencies

- Discord Bot token and application ID.
- Discord application configured with the `applications.commands` scope.
- Local n8n instance on `127.0.0.1:5678` with webhook endpoints.
- Node.js 20+ runtime.

## Risks

- **Command propagation delay** for global commands can confuse operators.
  - Mitigation: support `DISCORD_GUILD_ID` for immediate guild-scoped sync during development.
- **Webhook latency/timeouts** may cause interaction failures.
  - Mitigation: per-workflow or global timeout controls and explicit error messages.
- **Invalid workflow config** can prevent startup.
  - Mitigation: strict schema validation with field-level error output.

## References

- [Architecture](../architecture.md)
- [Product Spec: Discord Slash Commands to Trigger n8n Workflows](../product-specs/discord-slash-to-n8n-workflows.md)
- [ExecPlan: Discord Gateway n8n Bootstrap](../exec-plans/2026-02-25-discord-gateway-bootstrap.md)
