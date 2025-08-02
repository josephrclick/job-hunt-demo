// Model configurations for dynamic model testing
// Sprint v2-a4: Model Testing & Configuration Panel

export interface ModelConfig {
  provider:
    | "openai"
    | "anthropic"
    | "google"
    | "meta"
    | "mistral"
    | "perplexity";
  maxTokens: number;
  defaultTemperature: number;
  supportedParams: string[];
  costPer1kInput: number;
  costPer1kOutput: number;
  contextWindow: number;
  description?: string;
  openrouterId: string; // OpenRouter model ID
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  chunkLimit: number;
  similarityThreshold: number;
  useRecencyBoost: boolean;
  useQueryExpansion: boolean;
}

// Model configurations based on OpenRouter's model list
// Prices from https://openrouter.ai/models
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "gpt-4o-mini": {
    provider: "openai",
    openrouterId: "openai/gpt-4o-mini",
    maxTokens: 128000,
    contextWindow: 128000,
    defaultTemperature: 0.7,
    supportedParams: [
      "temperature",
      "maxTokens",
      "topP",
      "frequencyPenalty",
      "presencePenalty",
    ],
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    description: "Most cost-effective model for general tasks",
  },
  "gpt-4o": {
    provider: "openai",
    openrouterId: "openai/gpt-4o",
    maxTokens: 128000,
    contextWindow: 128000,
    defaultTemperature: 0.7,
    supportedParams: [
      "temperature",
      "maxTokens",
      "topP",
      "frequencyPenalty",
      "presencePenalty",
    ],
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    description: "Latest GPT-4 optimized for speed and cost",
  },
  "claude-3-5-sonnet": {
    provider: "anthropic",
    openrouterId: "anthropic/claude-3.5-sonnet",
    maxTokens: 200000,
    contextWindow: 200000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP", "topK"],
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    description: "Claude 3.5 Sonnet - balanced performance",
  },
  "claude-3-5-haiku": {
    provider: "anthropic",
    openrouterId: "anthropic/claude-3.5-haiku",
    maxTokens: 200000,
    contextWindow: 200000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP", "topK"],
    costPer1kInput: 0.0008,
    costPer1kOutput: 0.004,
    description: "Fast and affordable Claude model",
  },
  "gemini-2.0-flash-thinking": {
    provider: "google",
    openrouterId: "google/gemini-2.0-flash-thinking-exp:free",
    maxTokens: 32760,
    contextWindow: 32760,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP", "topK"],
    costPer1kInput: 0,
    costPer1kOutput: 0,
    description: "Experimental Gemini with reasoning - FREE",
  },
  "gemini-2.0-flash": {
    provider: "google",
    openrouterId: "google/gemini-2.0-flash-exp:free",
    maxTokens: 1048576,
    contextWindow: 1048576,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP", "topK"],
    costPer1kInput: 0,
    costPer1kOutput: 0,
    description: "Gemini 2.0 Flash - 1M context window - FREE",
  },
  "llama-3.1-70b": {
    provider: "meta",
    openrouterId: "meta-llama/llama-3.1-70b-instruct",
    maxTokens: 128000,
    contextWindow: 128000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 0.00064,
    costPer1kOutput: 0.00064,
    description: "Open source Llama 3.1 70B",
  },
  "mistral-large": {
    provider: "mistral",
    openrouterId: "mistralai/mistral-large",
    maxTokens: 128000,
    contextWindow: 128000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 0.003,
    costPer1kOutput: 0.009,
    description: "Mistral's flagship model",
  },
  sonar: {
    provider: "perplexity",
    openrouterId: "perplexity/sonar",
    maxTokens: 127000,
    contextWindow: 127000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 0.2,
    costPer1kOutput: 0.2,
    description: "Lightweight Q&A with web search & citations",
  },
  "sonar-pro": {
    provider: "perplexity",
    openrouterId: "perplexity/sonar-pro",
    maxTokens: 127000,
    contextWindow: 127000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 1.0,
    costPer1kOutput: 1.0,
    description: "Advanced search with more citations & context",
  },
  "sonar-reasoning": {
    provider: "perplexity",
    openrouterId: "perplexity/sonar-reasoning",
    maxTokens: 128000,
    contextWindow: 128000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 1.0,
    costPer1kOutput: 1.0,
    description: "DeepSeek R1-based reasoning with web search",
  },
  "sonar-reasoning-pro": {
    provider: "perplexity",
    openrouterId: "perplexity/sonar-reasoning-pro",
    maxTokens: 128000,
    contextWindow: 128000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 2.0,
    costPer1kOutput: 8.0,
    description: "Premier reasoning with Chain of Thought & search",
  },
  "sonar-deep-research": {
    provider: "perplexity",
    openrouterId: "perplexity/sonar-deep-research",
    maxTokens: 100000,
    contextWindow: 100000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 1.0,
    costPer1kOutput: 1.0,
    description: "Multi-step research & synthesis across sources",
  },
  "llama-3.1-sonar-large": {
    provider: "perplexity",
    openrouterId: "perplexity/llama-3.1-sonar-large-128k-online",
    maxTokens: 127000,
    contextWindow: 127000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 1.0,
    costPer1kOutput: 1.0,
    description: "Llama 3.1 Sonar Large with online search",
  },
  "llama-3.1-sonar-small": {
    provider: "perplexity",
    openrouterId: "perplexity/llama-3.1-sonar-small-128k-online",
    maxTokens: 127000,
    contextWindow: 127000,
    defaultTemperature: 0.7,
    supportedParams: ["temperature", "maxTokens", "topP"],
    costPer1kInput: 0.2,
    costPer1kOutput: 0.2,
    description: "Llama 3.1 Sonar Small - fast & efficient",
  },
};

export const DEFAULT_SETTINGS: ChatSettings = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 2000,
  chunkLimit: 10,
  similarityThreshold: 0.78,
  useRecencyBoost: false,
  useQueryExpansion: false,
};

export const PRESETS = {
  default: DEFAULT_SETTINGS,
  creative: {
    ...DEFAULT_SETTINGS,
    temperature: 1.2,
    maxTokens: 4000,
    chunkLimit: 15,
    similarityThreshold: 0.7,
  },
  precise: {
    ...DEFAULT_SETTINGS,
    temperature: 0.3,
    similarityThreshold: 0.85,
    chunkLimit: 8,
  },
  discovery: {
    ...DEFAULT_SETTINGS,
    chunkLimit: 20,
    useRecencyBoost: true,
    useQueryExpansion: true,
    maxTokens: 4000,
    temperature: 0.8,
  },
};

export function getModelConfig(modelId: string): ModelConfig | null {
  return MODEL_CONFIGS[modelId] || null;
}

export function validateParams(
  modelId: string,
  params: Record<string, unknown>,
) {
  const config = getModelConfig(modelId);
  if (!config) return params;

  // Filter out unsupported params
  const validated: Record<string, unknown> = {};
  config.supportedParams.forEach((param) => {
    if (params[param] !== undefined) {
      validated[param] = params[param];
    }
  });

  // Ensure max tokens doesn't exceed model limit
  if (
    validated.maxTokens &&
    typeof validated.maxTokens === "number" &&
    validated.maxTokens > config.maxTokens
  ) {
    validated.maxTokens = config.maxTokens;
  }

  return validated;
}

export function estimateCost(
  settings: ChatSettings,
  estimatedInputTokens: number = 2000,
  estimatedOutputTokens: number = 1000,
): string {
  const config = getModelConfig(settings.model);
  if (!config) return "Unknown";

  const inputCost = (estimatedInputTokens / 1000) * config.costPer1kInput;
  const outputCost = (estimatedOutputTokens / 1000) * config.costPer1kOutput;
  const totalCost = inputCost + outputCost;

  if (totalCost === 0) return "Free";

  return `~$${totalCost.toFixed(4)}`;
}

export function getModelDisplayName(modelId: string): string {
  const config = getModelConfig(modelId);
  if (!config) return modelId;

  const providerNames = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    meta: "Meta",
    mistral: "Mistral",
    perplexity: "Perplexity",
  };

  const provider = providerNames[config.provider] || config.provider;

  // Special handling for model names
  let displayName = modelId
    .replace(/-/g, " ")
    .replace("gpt", "GPT")
    .replace("llama", "Llama")
    .replace("sonar", "Sonar");

  // Capitalize first letter of each word
  displayName = displayName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `${provider} ${displayName}`;
}
