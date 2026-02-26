# discord-n8n-gateway

## Quick Start

```bash
pnpm install
cp .env.example .env
cp config/workflows.example.json config/workflows.json
pnpm dev
```

## Architecture Overview

This project runs a Discord Gateway bot that maps slash commands to local n8n webhook executions on `127.0.0.1:5678`. The OCI deployment target is outbound-only, so the system intentionally avoids inbound HTTP endpoints and relies on Discord Gateway + REST for command interactions. Command definitions are stored in repository config and validated at startup. See [Architecture](docs/architecture.md) for full domain and dependency details.

## Repository Structure

```
discord-n8n-gateway/
├── src/                   # Runtime implementation (layered modules)
│   ├── types/             # Schemas and shared types
│   ├── config/            # Env + file config loading/validation
│   ├── repo/              # External I/O adapters (n8n)
│   ├── service/           # Command mapping and payload shaping
│   └── runtime/           # Discord client and command registration
├── config/                # Workflow command config (JSON)
├── docs/                  # System of record for project knowledge
│   ├── architecture.md    # Domain model, layers, dependency rules
│   ├── golden-rules.md    # Numbered principles (enforced by harness check)
│   ├── design-docs/       # Design documentation for features and systems
│   ├── exec-plans/        # Versioned execution plans with progress tracking
│   ├── product-specs/     # Product specifications and requirements
│   ├── references/        # External references and integration notes
│   └── generated/         # Auto-generated artifacts (do not edit)
├── .opencode/agents/      # OpenCode subagents (reviewer, planner, sweep)
├── .claude/agents/        # Claude Code subagents (mirrors .opencode/agents/)
└── .harness/rules/        # Custom lint rules (YAML)
```

## Golden Rules

1. **AGENTS.md is a map, not a manual** — keep this file under 150 lines
2. **Validate boundaries** — parse and validate data at system edges, never probe
3. **Prefer shared utilities** — centralize invariants, avoid hand-rolled duplicates
4. **Every decision gets logged** — use ExecPlans for complex work
5. **Fix the environment, not the prompt** — add missing tools/docs/guardrails

See [Golden Rules](docs/golden-rules.md) for the complete list with rationale and enforcement.

## Documentation

All project knowledge lives in `docs/`. Start with the area relevant to your task:

| Directory | Purpose |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System architecture, domains, layers |
| [docs/golden-rules.md](docs/golden-rules.md) | Enforced principles and conventions |
| [docs/design-docs/](docs/design-docs/) | Design documentation for features |
| [docs/exec-plans/](docs/exec-plans/) | Execution plans for complex work |
| [docs/product-specs/](docs/product-specs/) | Product specifications |
| [docs/references/](docs/references/) | External docs, API references |
| [docs/generated/](docs/generated/) | Auto-generated artifacts |

## Working with This Repository

- Before making changes, read the relevant design doc in `docs/design-docs/`
- For complex work, create/update an ExecPlan in `docs/exec-plans/`
- Run `harness check` before submitting PRs
- Follow the layer dependency rules in [docs/architecture.md](docs/architecture.md)
- When something fails, ask: "What capability is missing?" then add it

## Build & Test Commands

```bash
pnpm build
pnpm test
harness check
```

## Code Style & Conventions

- Keep modules aligned to the documented layers
- Validate boundary inputs with schemas
- Prefer shared utilities over duplicated helpers
- Run `harness check` to validate project structure and documentation

## ExecPlans

When writing complex features or significant refactors, use an ExecPlan from design to implementation.
