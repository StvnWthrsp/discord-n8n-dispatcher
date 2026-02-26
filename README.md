# discord-n8n-gateway

Discord Gateway bot that triggers n8n workflows from slash commands. Built to run alongside local n8n. Minimal built-in logic, simple configuration to call arbitrary webhook endpoints.

## Why this shape

The bot is deployed on a secured cloud instance with no inbound internet access, so a Discord client cannot make calls to the bot directly. This requires a Discord Gateway setup to initiate the connection. The bot uses REST to make outbound calls, and calls n8n on `localhost:5678` locally.

## Quick Start

```bash
pnpm install
cp .env.example .env
cp config/workflows.example.json config/workflows.json
pnpm dev
```

## Commands

- `pnpm build` — compile TypeScript to `dist/`
- `pnpm test` — run unit tests
- `harness check` — validate documentation and repository rules (not currently working)

## Configuration

- Environment variables: `.env` (see `.env.example`)
- Workflow command definitions: `config/workflows.json` (see `config/workflows.example.json`)

## Documentation

- Architecture: [docs/architecture.md](docs/architecture.md)
- Design docs: [docs/design-docs/](docs/design-docs/)
- Product specs: [docs/product-specs/](docs/product-specs/)
- Execution plans: [docs/exec-plans/](docs/exec-plans/)
