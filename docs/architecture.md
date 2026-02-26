# Architecture

## System Overview

`discord-n8n-gateway` is an outbound-only Discord Gateway bot that translates slash commands into local n8n workflow executions. The bot opens a WebSocket connection to Discord and uses Discord REST to register command definitions, so no inbound HTTP listener is required. When a user runs a configured slash command, the bot validates command inputs, builds a structured payload, and sends it to an n8n webhook on `127.0.0.1:5678`. Results are returned to Discord as ephemeral interaction responses.

## Domain Model

- **Command Definition Domain** — Declares slash commands and options from `config/workflows.json`.
- **Interaction Dispatch Domain** — Parses Discord interactions and constructs typed n8n payloads.
- **Workflow Invocation Domain** — Calls n8n webhook endpoints with timeout and auth-header controls.
- **Runtime Domain** — Loads env/config, syncs Discord commands, and owns process lifecycle.

## Layer Structure

Each domain follows a fixed set of layers with strictly validated dependency directions:

```
Types → Config → Repo → Service → Runtime → UI
```

| Layer | Responsibility | Current Paths |
|---|---|---|
| **Types** | Shared type definitions and schemas | `src/types/` |
| **Config** | Configuration loading and validation | `src/config/` |
| **Repo** | External system I/O adapters | `src/repo/` |
| **Service** | Business orchestration and payload shaping | `src/service/` |
| **Runtime** | Lifecycle, event loop, and startup wiring | `src/runtime/`, `src/index.ts` |
| **UI** | User-facing interaction surface | Discord slash commands |

## Dependency Rules

- Code may only depend **forward** through layers (Types → Config → Repo → Service → Runtime → UI).
- `src/runtime/*` can depend on every prior layer; lower layers cannot import runtime modules.
- All boundary data is validated at ingress (`env.ts`, `workflows.ts`) before use.
- Workflow command definitions are repository data (`config/workflows.json`), not hardcoded runtime behavior.
- Shared helpers should live in dedicated modules and be reused instead of duplicated.

## Key Abstractions

- **`WorkflowDefinition` schema** (`src/types/workflow.ts`) — Canonical command and option contract.
- **`loadWorkflowConfig`** (`src/config/workflows.ts`) — File + JSON + schema validation at startup.
- **`N8nClient`** (`src/repo/n8n-client.ts`) — Local webhook invocation with timeout and optional auth header.
- **`buildDiscordCommands` / `createN8nPayload`** (`src/service/workflow-command-service.ts`) — Command registration model and workflow request payload.
- **`startBot`** (`src/runtime/bot.ts`) — Gateway event handling and interaction response flow.

## Technology Choices

- **Node.js + TypeScript (ESM)** for predictable runtime behavior and compile-time safety.
- **discord.js v14** for Gateway events, slash command builders, and REST registration.
- **zod** for boundary schema validation (`env`, workflow config).
- **n8n webhooks on localhost** (`N8N_BASE_URL=http://127.0.0.1:5678`) to keep workflow execution private inside the OCI instance.
