import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";

import type {
  WorkflowDefinition,
  WorkflowOptionDefinition
} from "../types/workflow.js";

export interface N8nWorkflowPayload {
  command: string;
  requestedAt: string;
  requestedBy: {
    userId: string;
    username: string;
    globalName: string | null;
  };
  context: {
    guildId: string | null;
    channelId: string | null;
    interactionId: string;
  };
  inputs: Record<string, string | number | boolean>;
}

export function buildDiscordCommands(
  workflows: WorkflowDefinition[]
): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
  return workflows.map((workflow) => {
    const builder = new SlashCommandBuilder()
      .setName(workflow.command)
      .setDescription(workflow.description);

    for (const option of workflow.options) {
      addOption(builder, option);
    }

    return builder.toJSON();
  });
}

export function createN8nPayload(
  workflow: WorkflowDefinition,
  interaction: ChatInputCommandInteraction
): N8nWorkflowPayload {
  const inputs = collectInputs(workflow, interaction);

  return {
    command: workflow.command,
    requestedAt: new Date().toISOString(),
    requestedBy: {
      userId: interaction.user.id,
      username: interaction.user.username,
      globalName: interaction.user.globalName
    },
    context: {
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      interactionId: interaction.id
    },
    inputs
  };
}

export function formatResponseBody(value: unknown, maxLength = 1200): string {
  if (value == null) {
    return "(no response body)";
  }

  const raw = typeof value === "string" ? value : safeStringify(value);
  if (raw.length <= maxLength) {
    return raw;
  }

  return `${raw.slice(0, maxLength)}...`;
}

function addOption(
  builder: SlashCommandBuilder,
  option: WorkflowOptionDefinition
): void {
  switch (option.type) {
    case "string":
      builder.addStringOption((value) =>
        value
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required)
      );
      return;
    case "integer":
      builder.addIntegerOption((value) =>
        value
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required)
      );
      return;
    case "number":
      builder.addNumberOption((value) =>
        value
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required)
      );
      return;
    case "boolean":
      builder.addBooleanOption((value) =>
        value
          .setName(option.name)
          .setDescription(option.description)
          .setRequired(option.required)
      );
      return;
    default:
      throw new Error(
        `Unsupported workflow option type: ${(option as { type: unknown }).type}`
      );
  }
}

function collectInputs(
  workflow: WorkflowDefinition,
  interaction: ChatInputCommandInteraction
): Record<string, string | number | boolean> {
  const inputs: Record<string, string | number | boolean> = {};

  for (const option of workflow.options) {
    let value: string | number | boolean | null = null;

    switch (option.type) {
      case "string":
        value = interaction.options.getString(option.name, false);
        break;
      case "integer":
        value = interaction.options.getInteger(option.name, false);
        break;
      case "number":
        value = interaction.options.getNumber(option.name, false);
        break;
      case "boolean":
        value = interaction.options.getBoolean(option.name, false);
        break;
      default:
        throw new Error(`Unsupported option type for ${option.name}`);
    }

    if (value == null) {
      if (option.required) {
        throw new Error(`Required option '${option.name}' was not provided.`);
      }
      continue;
    }

    inputs[option.name] = value;
  }

  return inputs;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "[unserializable response]";
  }
}
