# Discord + n8n Integration Reference

**Source URLs**

- Discord interactions and slash commands: <https://discord.com/developers/docs/interactions/application-commands>
- Discord Gateway docs: <https://discord.com/developers/docs/topics/gateway>
- n8n webhook docs: <https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/>

**Captured:** 2026-02-25

## Integration Notes

- Discord bots can operate without inbound HTTP by using the Gateway (WebSocket) and Discord REST APIs.
- Slash command registration happens via Discord REST and can be scoped globally or to a specific guild.
- n8n webhooks can be triggered locally from the same host; no public ingress is required when caller and n8n are co-located.
- Keep payload contracts stable by versioning command schema in repository config.
