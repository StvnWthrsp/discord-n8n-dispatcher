import { readFile } from "node:fs/promises";
import path from "node:path";

import { workflowListSchema, type WorkflowDefinition } from "../types/workflow.js";

export async function loadWorkflowConfig(
  configPath: string
): Promise<WorkflowDefinition[]> {
  const absolutePath = path.resolve(configPath);

  let contents: string;
  try {
    contents = await readFile(absolutePath, "utf8");
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown file read error.";
    throw new Error(
      `Failed to read workflow config at ${absolutePath}. ${detail}`
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(contents);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown JSON parse error.";
    throw new Error(
      `Workflow config at ${absolutePath} is not valid JSON. ${detail}`
    );
  }

  const parsed = workflowListSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Workflow config at ${absolutePath} failed validation:\n${details}`
    );
  }

  return parsed.data;
}
