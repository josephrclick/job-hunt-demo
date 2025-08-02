// OpenRouter provider for unified access to multiple LLM models
// Sprint v2-a4: Model Testing & Configuration Panel

import { getModelConfig } from "@/lib/models/registry";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterParams {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterProvider {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is required");
    }
  }

  async chat(params: OpenRouterParams): Promise<Response> {
    const config = getModelConfig(params.model);
    if (!config) {
      throw new Error(`Unknown model: ${params.model}`);
    }

    // Map our model ID to OpenRouter's model ID
    const openRouterModel = config.openrouterId;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002",
        "X-Title": "Deal Intelligence Hub",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        top_p: params.top_p,
        top_k: params.top_k,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty,
        stream: params.stream,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response;
  }

  async *streamChat(
    params: OpenRouterParams,
  ): AsyncGenerator<string, void, unknown> {
    const response = await this.chat({ ...params, stream: true });
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Skip invalid JSON chunks

            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Get available models from OpenRouter
  async getModels() {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002",
        "X-Title": "Deal Intelligence Hub",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    return response.json();
  }
}
