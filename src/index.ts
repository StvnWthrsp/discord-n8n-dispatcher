import "dotenv/config";

import { loadEnv } from "./config/env.js";
import { loadWorkflowConfig } from "./config/workflows.js";
import { N8nClient } from "./repo/n8n-client.js";
import { startBot } from "./runtime/bot.js";
import { syncDiscordCommands } from "./runtime/register-commands.js";
import { buildDiscordCommands } from "./service/workflow-command-service.js";

async function main(): Promise<void> {
  const env = loadEnv();

  const workflows = await loadWorkflowConfig(env.workflowConfigPath);
  const commands = buildDiscordCommands(workflows);

  await syncDiscordCommands({
    token: env.discordBotToken,
    applicationId: env.discordApplicationId,
    commands,
    ...(env.discordGuildId ? { guildId: env.discordGuildId } : {})
  });

  const n8nClient = new N8nClient({
    baseUrl: env.n8nBaseUrl,
    defaultTimeoutMs: env.n8nTimeoutMs,
    ...(env.n8nAuthHeaderName && env.n8nAuthHeaderValue
      ? {
          authHeaderName: env.n8nAuthHeaderName,
          authHeaderValue: env.n8nAuthHeaderValue
        }
      : {})
  });

  await startBot({
    token: env.discordBotToken,
    workflows,
    n8nClient
  });

  console.log("Discord command sync complete.");
  if (env.discordGuildId) {
    console.log(`Commands synced to guild ${env.discordGuildId}.`);
  } else {
    console.log("Commands synced globally. This can take up to one hour to propagate.");
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
