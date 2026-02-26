import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional()
);

const envSchema = z
  .object({
    DISCORD_BOT_TOKEN: z.string().min(1),
    DISCORD_APPLICATION_ID: z.string().min(1),
    DISCORD_GUILD_ID: optionalString,
    N8N_BASE_URL: z.string().url().default("http://127.0.0.1:5678"),
    N8N_TIMEOUT_MS: z.coerce.number().int().positive().max(120000).default(8000),
    WORKFLOW_CONFIG_PATH: z.string().min(1).default("config/workflows.json"),
    N8N_AUTH_HEADER_NAME: optionalString,
    N8N_AUTH_HEADER_VALUE: optionalString
  })
  .superRefine((value, ctx) => {
    const onlyNameProvided =
      value.N8N_AUTH_HEADER_NAME && !value.N8N_AUTH_HEADER_VALUE;
    const onlyValueProvided =
      !value.N8N_AUTH_HEADER_NAME && value.N8N_AUTH_HEADER_VALUE;

    if (onlyNameProvided || onlyValueProvided) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "N8N_AUTH_HEADER_NAME and N8N_AUTH_HEADER_VALUE must be set together.",
        path: ["N8N_AUTH_HEADER_NAME"]
      });
    }
  });

export interface AppEnv {
  discordBotToken: string;
  discordApplicationId: string;
  discordGuildId?: string;
  n8nBaseUrl: string;
  n8nTimeoutMs: number;
  workflowConfigPath: string;
  n8nAuthHeaderName?: string;
  n8nAuthHeaderValue?: string;
}

export function parseEnv(source: NodeJS.ProcessEnv): AppEnv {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  const value = parsed.data;

  const env: AppEnv = {
    discordBotToken: value.DISCORD_BOT_TOKEN,
    discordApplicationId: value.DISCORD_APPLICATION_ID,
    n8nBaseUrl: value.N8N_BASE_URL,
    n8nTimeoutMs: value.N8N_TIMEOUT_MS,
    workflowConfigPath: value.WORKFLOW_CONFIG_PATH
  };

  if (value.DISCORD_GUILD_ID) {
    env.discordGuildId = value.DISCORD_GUILD_ID;
  }

  if (value.N8N_AUTH_HEADER_NAME && value.N8N_AUTH_HEADER_VALUE) {
    env.n8nAuthHeaderName = value.N8N_AUTH_HEADER_NAME;
    env.n8nAuthHeaderValue = value.N8N_AUTH_HEADER_VALUE;
  }

  return env;
}

export function loadEnv(): AppEnv {
  return parseEnv(process.env);
}
