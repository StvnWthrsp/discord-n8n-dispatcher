import { describe, expect, it } from "vitest";

import { workflowListSchema } from "../src/types/workflow.js";

describe("workflowListSchema", () => {
  it("rejects duplicate command names", () => {
    const parsed = workflowListSchema.safeParse([
      {
        command: "deploy_preview",
        description: "one",
        webhookPath: "/webhook/a"
      },
      {
        command: "deploy_preview",
        description: "two",
        webhookPath: "/webhook/b"
      }
    ]);

    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate options inside one command", () => {
    const parsed = workflowListSchema.safeParse([
      {
        command: "run_report",
        description: "report",
        webhookPath: "/webhook/report",
        options: [
          {
            name: "days",
            description: "a",
            type: "integer",
            required: false
          },
          {
            name: "days",
            description: "b",
            type: "integer",
            required: false
          }
        ]
      }
    ]);

    expect(parsed.success).toBe(false);
  });
});
