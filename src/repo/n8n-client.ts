import type { WorkflowDefinition } from "../types/workflow.js";

export interface N8nClientOptions {
  baseUrl: string;
  defaultTimeoutMs: number;
  authHeaderName?: string;
  authHeaderValue?: string;
}

export interface N8nInvokeResult {
  status: number;
  body: unknown;
}

export class N8nClient {
  private readonly baseUrl: URL;

  constructor(private readonly options: N8nClientOptions) {
    this.baseUrl = new URL(options.baseUrl);
  }

  async invokeWorkflow(
    workflow: WorkflowDefinition,
    payload: unknown
  ): Promise<N8nInvokeResult> {
    const timeoutMs = workflow.timeoutMs ?? this.options.defaultTimeoutMs;
    const url = new URL(workflow.webhookPath, this.baseUrl);

    const headers: Record<string, string> = {
      "content-type": "application/json"
    };

    if (this.options.authHeaderName && this.options.authHeaderValue) {
      headers[this.options.authHeaderName] = this.options.authHeaderValue;
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: abortController.signal
      });

      const bodyText = await response.text();
      const parsedBody = tryParseJson(bodyText);

      if (!response.ok) {
        throw new Error(
          `n8n responded with HTTP ${response.status}. Body: ${stringifyForLog(
            parsedBody
          )}`
        );
      }

      return {
        status: response.status,
        body: parsedBody
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`n8n request timed out after ${timeoutMs}ms.`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function tryParseJson(value: string): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function stringifyForLog(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable body]";
  }
}
