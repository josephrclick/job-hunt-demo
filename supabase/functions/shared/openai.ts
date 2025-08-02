export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAICompletionRequest {
  model: string
  messages: OpenAIMessage[]
  temperature?: number
  max_tokens?: number
  response_format?: { type: "json_object" }
}

export interface OpenAICompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: OpenAIMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface OpenAIEmbeddingRequest {
  model: string
  input: string
}

export interface OpenAIEmbeddingResponse {
  object: string
  data: Array<{
    object: string
    embedding: number[]
    index: number
  }>
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export interface OpenAIError {
  error: {
    message: string
    type: string
    param?: string
    code?: string
  }
}

const OPENAI_TIMEOUT = 30000 // 30 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`)
    }
    throw error
  }
}

async function makeOpenAIRequest(url: string, body: unknown, retries = MAX_RETRIES): Promise<Response> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }, OPENAI_TIMEOUT)

      if (response.ok) {
        return response
      }

      // Handle rate limiting (429) with exponential backoff
      if (response.status === 429 && attempt < retries) {
        const retryAfter = response.headers.get('retry-after')
        const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAY * Math.pow(2, attempt)

  return await response.json() as OpenAIEmbeddingResponse
}