import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { embeddingService } from '@/lib/services/embeddingService';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize rate limiter with Upstash Redis
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
  prefix: "@jobhub/chat",
  analytics: true
});

const dailyRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(50, "1 d"), // 50 requests per day
  prefix: "@jobhub/chat-daily",
  analytics: true
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get comprehensive user profile for personalization
    const { data: profile } = await supabase
      .from('user_profile')
      .select(`
        uid,
        name,
        current_title,
        seniority,
        location,
        min_base_comp,
        remote_pref,
        strengths,
        red_flags,
        dealbreakers,
        preferences
      `)
      .eq('uid', user.id)
      .single();
      
    if (!profile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting checks
    const [hourlyCheck, dailyCheck] = await Promise.all([
      ratelimit.limit(user.id),
      dailyRateLimit.limit(user.id)
    ]);

    if (!hourlyCheck.success) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        type: 'hourly',
        reset: new Date(hourlyCheck.reset)
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!dailyCheck.success) {
      return new Response(JSON.stringify({ 
        error: 'Daily rate limit exceeded',
        type: 'daily',
        reset: new Date(dailyCheck.reset)
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const { messages, session_id }: { 
      messages: UIMessage[], 
      session_id?: string // Future-proofing
    } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the latest user message for RAG context
    const latestUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();

    let ragContext = '';
    const userMessageContent = (latestUserMessage as any)?.content || '';
      
    if (userMessageContent && typeof userMessageContent === 'string') {
      try {
        // Generate embedding for user query
        const queryEmbedding = await embeddingService.embedTexts([userMessageContent]);
        
        if (queryEmbedding[0]?.embedding) {
          // Search for relevant context in kb_embeddings using match_chunks
          const { data: relevantChunks } = await (supabase as any).rpc('match_chunks', {
            query_embedding: queryEmbedding[0].embedding,
            match_threshold: 0.3,
            match_count: 5
          });

          if (relevantChunks && relevantChunks.length > 0) {
            ragContext = relevantChunks
              .map((chunk: any) => chunk.content)
              .join('\n\n');
          }
        }
      } catch (ragError) {
        console.error('RAG context retrieval failed:', ragError);
        // Continue without RAG context rather than failing
      }
    }

    // Build user profile context
    const userContext = `USER PROFILE:
Name: ${profile.name || 'User'}
Current Title: ${profile.current_title || 'Not specified'}
Seniority Level: ${profile.seniority || 'Not specified'}
Location: ${profile.location || 'Not specified'}
Minimum Base Compensation: ${profile.min_base_comp ? `$${profile.min_base_comp.toLocaleString()}` : 'Not specified'}
Remote Work Preference: ${profile.remote_pref || 'Not specified'}
Key Strengths: ${profile.strengths ? JSON.stringify(profile.strengths) : 'None specified'}
Red Flags: ${profile.red_flags ? JSON.stringify(profile.red_flags) : 'None specified'}
Dealbreakers: ${profile.dealbreakers ? JSON.stringify(profile.dealbreakers) : 'None specified'}
Other Preferences: ${profile.preferences ? JSON.stringify(profile.preferences) : 'None specified'}`;

    // System prompt with RAG context and user profile
    const systemPrompt = `You are JobHunt Hub's AI assistant, specialized in helping users with job hunting, career advice, and analyzing job opportunities.

${userContext}

${ragContext ? `RELEVANT JOB DATA:
---
${ragContext}
---

Use this job data context along with the user profile to provide highly personalized responses. Reference specific job details, fit scores, and alignment with the user's preferences when relevant.` : 'No specific job data found for this query. Use the user profile to provide personalized general job hunting advice.'}

GUIDELINES:
- Always consider the user's profile, preferences, strengths, and dealbreakers in your responses
- Be concise and actionable in your advice
- Reference specific job details when available and explain how they align with the user's profile
- If discussing compensation, consider their minimum base compensation requirement
- When suggesting roles, factor in their remote work preference and location
- Highlight how opportunities match their strengths and avoid their red flags/dealbreakers
- If asked about topics unrelated to job hunting, politely redirect to career-related topics
- Keep responses under 250 words unless more detail is specifically requested`;

    // Stream response using Vercel AI SDK
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      maxOutputTokens: 500, // Control costs
      temperature: 0.7,
      onFinish: async ({ usage }) => {
        // Track token usage
        try {
          await (supabase as any).rpc('update_chat_usage', {
            p_user_id: user.id,
            p_tokens_used: usage.totalTokens || 0
          });
        } catch (error) {
          console.error('Failed to update chat usage:', error);
        }
      }
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'Please try again later'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}