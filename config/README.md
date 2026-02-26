# Workflow Configuration

Slash commands are defined in `config/workflows.json`.

1. Copy the example:
   - `cp config/workflows.example.json config/workflows.json`
2. Edit each command to point at the matching local n8n webhook path.
3. Restart the bot to re-sync commands with Discord.

## Schema

Each entry supports:

- `command`: Discord slash command name (`[a-z0-9_-]`, max 32 chars)
- `description`: command description (1-100 chars)
- `webhookPath`: path appended to `N8N_BASE_URL` (must start with `/`)
- `timeoutMs` (optional): override global timeout for this workflow
- `options` (optional): up to 25 command options

Option fields:

- `name`: option name (`[a-z0-9_-]`, max 32 chars)
- `description`: option description (1-100 chars)
- `type`: one of `string`, `integer`, `number`, `boolean`
- `required`: boolean
