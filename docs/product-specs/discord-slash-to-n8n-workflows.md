# Product Spec: Discord Slash Commands to Trigger n8n Workflows

**Status:** Active
**Owner:** Engineering
**Date:** 2026-02-25

## Summary

Operators can run selected automation workflows directly from Discord slash commands. Each command maps to an n8n webhook hosted on the same OCI machine (`localhost:5678`).

## Users

- Primary: operators running routine automation tasks from Discord.
- Secondary: engineers adding new workflow command definitions.

## Requirements

1. The system must register slash commands with Discord from repository-managed configuration.
2. The system must trigger mapped n8n webhooks using outbound/local calls only.
3. The system must include command metadata and user/context info in every workflow payload.
4. The system must return command execution success/failure feedback in Discord.
5. The system must run with no inbound networking requirement.

## Constraints

- Runtime environment is Oracle Cloud with internet egress only.
- n8n is local to the same host and reachable via `http://127.0.0.1:5678`.
- Command definitions must remain human-editable in repo.

## Success Criteria

- A configured command appears in Discord after startup.
- Running a command executes the expected n8n workflow.
- Errors are visible to the command invoker with actionable text.
