import { describe, expect, it } from "vitest";

import { parseEnv } from "../src/config/env.js";

describe("parseEnv", () => {
  it("applies defaults", () => {
    const env = parseEnv({
      DISCORD_BOT_TOKEN: "token",
      DISCORD_APPLICATION_ID: "app-id"
    });

    expect(env.n8nBaseUrl).toBe("http://127.0.0.1:5678");
    expect(env.n8nTimeoutMs).toBe(8000);
    expect(env.workflowConfigPath).toBe("config/workflows.json");
  });

  it("requires auth header name/value pair", () => {
    expect(() =>
      parseEnv({
        DISCORD_BOT_TOKEN: "token",
        DISCORD_APPLICATION_ID: "app-id",
        N8N_AUTH_HEADER_NAME: "x-api-key"
      })
    ).toThrow(/must be set together/);
  });
});
