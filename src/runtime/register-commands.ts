import {
  REST,
  Routes,
  type RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";

export interface SyncDiscordCommandsInput {
  token: string;
  applicationId: string;
  guildId?: string;
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[];
}

export async function syncDiscordCommands(
  input: SyncDiscordCommandsInput
): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(input.token);

  if (input.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(input.applicationId, input.guildId),
      {
        body: input.commands
      }
    );
    return;
  }

  await rest.put(Routes.applicationCommands(input.applicationId), {
    body: input.commands
  });
}
