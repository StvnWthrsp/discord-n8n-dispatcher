import { ApplicationCommandOptionType } from "discord.js";
import { describe, expect, it } from "vitest";

import { buildDiscordCommands } from "../src/service/workflow-command-service.js";

describe("buildDiscordCommands", () => {
  it("maps workflow options to Discord option types", () => {
    const commands = buildDiscordCommands([
      {
        command: "deploy_preview",
        description: "Deploy preview",
        webhookPath: "/webhook/deploy-preview",
        options: [
          {
            name: "branch",
            description: "Git branch",
            type: "string",
            required: true
          }
        ]
      }
    ]);

    const [command] = commands;
    expect(command?.name).toBe("deploy_preview");
    expect(command?.options?.[0]).toMatchObject({
      name: "branch",
      required: true,
      type: ApplicationCommandOptionType.String
    });
  });
});
