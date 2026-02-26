import {
  Client,
  Events,
  GatewayIntentBits,
  type ChatInputCommandInteraction
} from "discord.js";

import { N8nClient } from "../repo/n8n-client.js";
import {
  createN8nPayload,
  formatResponseBody
} from "../service/workflow-command-service.js";
import type { WorkflowDefinition } from "../types/workflow.js";

export interface StartBotInput {
  token: string;
  workflows: WorkflowDefinition[];
  n8nClient: N8nClient;
}

export async function startBot(input: StartBotInput): Promise<Client> {
  const workflowMap = new Map(
    input.workflows.map((workflow) => [workflow.command, workflow])
  );

  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord bot connected as ${readyClient.user.tag}`);
    console.log(`Loaded ${workflowMap.size} workflow command(s).`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    await handleChatCommand(interaction, workflowMap, input.n8nClient);
  });

  await client.login(input.token);
  return client;
}

async function handleChatCommand(
  interaction: ChatInputCommandInteraction,
  workflowMap: Map<string, WorkflowDefinition>,
  n8nClient: N8nClient
): Promise<void> {
  const workflow = workflowMap.get(interaction.commandName);
  if (!workflow) {
    await interaction.reply({
      content: `No workflow is configured for /${interaction.commandName}.`,
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const payload = createN8nPayload(workflow, interaction);
    const result = await n8nClient.invokeWorkflow(workflow, payload);
    const body = formatResponseBody(result.body);

    const response = truncateDiscordMessage(
      `Triggered /${workflow.command} successfully (HTTP ${result.status}).\n\n${body}`
    );

    await interaction.editReply({ content: response });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected workflow trigger error.";

    await interaction.editReply({
      content: truncateDiscordMessage(
        `Failed to trigger /${workflow.command}: ${message}`
      )
    });
  }
}

function truncateDiscordMessage(content: string, maxLength = 2000): string {
  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength - 3)}...`;
}
