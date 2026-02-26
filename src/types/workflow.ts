import { z } from "zod";

const slashNamePattern = /^[a-z0-9_-]{1,32}$/;

export const workflowOptionTypeSchema = z.enum([
  "string",
  "integer",
  "number",
  "boolean"
]);

export const workflowOptionSchema = z.object({
  name: z
    .string()
    .regex(
      slashNamePattern,
      "Option names must match [a-z0-9_-] and be <= 32 chars."
    ),
  description: z.string().min(1).max(100),
  type: workflowOptionTypeSchema,
  required: z.boolean().default(false)
});

export const workflowSchema = z.object({
  command: z
    .string()
    .regex(
      slashNamePattern,
      "Command names must match [a-z0-9_-] and be <= 32 chars."
    ),
  description: z.string().min(1).max(100),
  webhookPath: z.string().min(1).startsWith("/"),
  timeoutMs: z.number().int().positive().max(120000).optional(),
  options: z.array(workflowOptionSchema).max(25).default([])
});

export const workflowListSchema = z
  .array(workflowSchema)
  .min(1)
  .superRefine((workflows, ctx) => {
    const seenCommands = new Set<string>();

    workflows.forEach((workflow, workflowIndex) => {
      if (seenCommands.has(workflow.command)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate command: ${workflow.command}`,
          path: [workflowIndex, "command"]
        });
      }

      seenCommands.add(workflow.command);

      const seenOptions = new Set<string>();
      workflow.options.forEach((option, optionIndex) => {
        if (seenOptions.has(option.name)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate option '${option.name}' in command '${workflow.command}'`,
            path: [workflowIndex, "options", optionIndex, "name"]
          });
        }

        seenOptions.add(option.name);
      });
    });
  });

export type WorkflowOptionType = z.infer<typeof workflowOptionTypeSchema>;
export type WorkflowOptionDefinition = z.infer<typeof workflowOptionSchema>;
export type WorkflowDefinition = z.infer<typeof workflowSchema>;
