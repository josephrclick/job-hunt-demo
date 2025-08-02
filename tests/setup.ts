import { vi } from 'vitest';

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.EXTENSION_API_KEY = 'test-extension-api-key';
process.env.INTERNAL_API_SECRET = 'test-internal-secret';
process.env.JD_EXTRACT_MODEL = 'gpt-4o-mini';
process.env.JD_ANALYSIS_MODEL = 'gpt-4o-mini';
process.env.CONFIDENCE_THRESHOLD = '50';
process.env.EMBED_MODEL = 'text-embedding-3-small';

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((body, init) => ({
      json: async () => body,
      status: init?.status || 200,
      headers: new Map()
    }))
  }
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    },
    embeddings: {
      create: vi.fn()
    }
  }))
}));

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis()
    }))
  }))
}));

// Global test utilities
global.createMockRequest = (options: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  url?: string;
}) => {
  const headers = new Map();
  Object.entries(options.headers || {}).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return {
    method: options.method || 'POST',
    headers,
    json: async () => options.body,
    text: async () => JSON.stringify(options.body),
    url: options.url || 'http://localhost:3002/api/jobs/enrich'
  };
};

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});