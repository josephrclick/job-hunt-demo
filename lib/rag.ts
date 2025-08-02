import type { Json, Database } from "@/supabase/supabase.generated";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

interface RawRPCChunk {
  content: string;
  source_type: Database["public"]["Enums"]["kb_source_type"];
  source_row_id: string;
  metadata: Json;
  similarity: number;
  tags?: string[];
}

interface TempChunkResult {
  id: string;
  content: string;
  source_name: string;
  metadata: Json;
  similarity: number;
  priority_score?: number;
}

interface VerticalChunkResult {
  id: string;
  content: string;
  metadata: Json;
  similarity: number;
}

export interface ContextChunk extends RawRPCChunk {
  tokens: number;
}

export interface GetContextFilters {
  dealId?: string;
  tags?: string[]; // e.g. ['urgent', 'policy']
  limit?: number; // Override the default chunk limit
  threadId?: string; // For thread-specific chunks
  vertical?: string; // For vertical knowledge filtering
  industryLensEnabled?: boolean; // Whether to fetch vertical chunks
  similarityThreshold?: number; // Minimum similarity score for chunks
  useRecencyBoost?: boolean; // Apply recency boost to recent content
  useQueryExpansion?: boolean; // Expand query with related terms
}

// New enhanced interface for retrieval optimization
export interface GetContextOptions {
  query: string;
  tags?: string[];
  threadId?: string;
  chunkLimit?: number; // New parameter
  useRecencyBoost?: boolean; // Flag for using recency service
  useQueryExpansion?: boolean; // Flag for using expansion service
  recencyWindowDays?: number; // Custom recency window
  recencyBoostAmount?: number; // Custom boost amount
}

export async function getContext(
  query: string,
  filters: GetContextFilters = {},
  maxTokens: number = 1000,
): Promise<ContextChunk[]> {
  const {
    dealId,
    tags,
    limit,
    threadId,
    vertical,
    industryLensEnabled,
    similarityThreshold,
  } = filters;

  const openaiKey = process.env.OPENAI_API_KEY!;
  if (!openaiKey) throw new Error("OpenAI API key not configured");

  // TODO: Implement query expansion when useQueryExpansion is true
  // This would call /api/enhance/expand-query to get additional search terms

  // TODO: Implement recency boost when useRecencyBoost is true
  // This would call /api/enhance/recency to boost recent content

  const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: query }),
  });
  if (!embedRes.ok) {
    const err = await embedRes.text();
    throw new Error(`Embedding failed: ${embedRes.status} ${err}`);
  }
  const embedData = await embedRes.json();
  const qEmb: number[] = embedData.data[0].embedding;

  // If limit is provided, use it for thread, deal and global queries
  const factor = maxTokens / 1000;
  const threadLimit = limit || (threadId ? Math.ceil(5 * factor) : 0);
  const dealLimit = limit || (dealId ? Math.ceil(6 * factor) : 0);
  const globalLimit = limit || Math.ceil(6 * factor);

  // Reserve up to 5 chunks for vertical knowledge when enabled
  const verticalLimit =
    industryLensEnabled && vertical ? Math.min(5, Math.ceil(5 * factor)) : 0;
  const adjustedGlobalLimit = Math.max(1, globalLimit - verticalLimit);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Debug: Check if thread has any embeddings
  if (threadId) {
    const { data: tempEmbeddings, error: checkError } = await supabase
      .from("chat_temp_embeddings")
      .select("id, source_name, content")
      .eq("thread_id", threadId)
      .limit(3);

    if (tempEmbeddings && tempEmbeddings.length > 0) {

    }
    if (checkError) {

    }
  }

  // Check if query is about jobs/career to include user profile
  const isJobRelated = /job|career|position|role|hire|hiring|opportunity|compensation|salary|remote|skill|experience|fit/i.test(query);
  
  // Execute thread query separately for better debugging
  let threadRes: { data: TempChunkResult[] | null; error: unknown } = {
    data: [],
    error: null,
  };
  if (threadId) {

    const tempRes = await supabase.rpc("match_chat_temp_chunks", {
      query_embedding: qEmb,
      thread_id_param: threadId,
      match_threshold: similarityThreshold || 0.1, // Use custom threshold or default
      match_count: threadLimit,
    });
    threadRes = { data: tempRes.data || [], error: tempRes.error };

  }

  const [dealRes, globalRes, verticalRes, userProfileRes] = await Promise.all([
    dealId
      ? supabase.rpc("match_chunks", {
          p_query_embedding: qEmb,
          p_deal_id: dealId,
          p_limit: dealLimit,
          p_similarity_threshold: similarityThreshold || 0.1, // Use custom threshold or default
          p_tags: tags ?? null,
        })
      : Promise.resolve({ data: [], error: null }),
    supabase.rpc("match_chunks", {
      p_query_embedding: qEmb,
      p_deal_id: null,
      p_limit: adjustedGlobalLimit,
      p_similarity_threshold: 0.1, // Lower threshold for more inclusive results
      p_tags: tags ?? null,
    }),
    verticalLimit > 0 && vertical
      ? (() => {

          return supabase.rpc("match_vertical_chunks", {
            query_embedding: qEmb,
            vertical_filter: vertical,
            match_threshold: similarityThreshold || 0.1, // Use custom threshold or default
            match_count: verticalLimit,
          });
        })()
      : (() => {

          return Promise.resolve({ data: [], error: null });
        })(),
    // Fetch user profile if job-related query
    isJobRelated
      ? supabase
          .from("user_profile")
          .select("*")
          .limit(1)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (
    threadRes.error ||
    dealRes.error ||
    globalRes.error ||
    verticalRes.error ||
    (userProfileRes.error && userProfileRes.error.code !== 'PGRST116') // Ignore "no rows" error
  ) {

    throw (
      threadRes.error ?? dealRes.error ?? globalRes.error ?? verticalRes.error ?? userProfileRes.error!
    );
  }

  // Debug vertical retrieval results
  if (
    verticalLimit > 0 &&
    (!verticalRes.data || verticalRes.data.length === 0)
  ) {

  } else if (verticalRes.data && verticalRes.data.length > 0) {

  }

  const seen = new Set<string>();
  const merged: Array<RawRPCChunk & { priority?: number }> = [];

  // Process user profile first if job-related and profile exists
  if (isJobRelated && userProfileRes.data) {
    const profile = userProfileRes.data;
    const profileContent = `User Profile:
Name: ${profile.name || 'Not specified'}
Current Role: ${profile.current_title || 'Not specified'}
Location: ${profile.location || 'Not specified'}
Seniority: ${profile.seniority || 'Not specified'}
Minimum Base Compensation: ${profile.min_base_comp ? `$${profile.min_base_comp.toLocaleString()}` : 'Not specified'}
Remote Preference: ${profile.remote_pref || 'Not specified'}

Strengths:
${profile.strengths ? profile.strengths.join('\n- ') : 'Not specified'}

Red Flags to Avoid:
${profile.red_flags ? profile.red_flags.join('\n- ') : 'Not specified'}

Dealbreakers:
${profile.dealbreakers ? profile.dealbreakers.join('\n- ') : 'Not specified'}

Additional Preferences:
${profile.preferences ? JSON.stringify(profile.preferences, null, 2) : 'None'}`;

    merged.push({
      content: profileContent,
      source_type: "note" as const,
      source_row_id: profile.uid,
      metadata: {
        title: "User Profile",
        type: "user_profile",
        is_profile: true,
      },
      similarity: 0.95, // High similarity for user's own profile
      tags: ["profile", "user"],
      priority: 2.0, // Highest priority
    });
  }

  // Process thread-specific chunks first (highest priority)
  for (const c of threadRes.data ?? []) {
    const key = c.content.slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({
        content: c.content,
        source_type: "doc" as const, // Thread attachments are treated as documents
        source_row_id: c.id,
        metadata: {
          ...(typeof c.metadata === "object" && c.metadata !== null
            ? c.metadata
            : {}),
          source_name: c.source_name,
          thread_attachment: true,
        },
        similarity: c.similarity,
        tags: [],
        priority: c.priority_score || 1.5,
      });
    }
  }

  // Process vertical knowledge chunks (high priority with TAG_BOOST)
  const tagBoost = parseFloat(process.env.TAG_BOOST || "0.05");
  for (const c of (verticalRes.data as VerticalChunkResult[]) ?? []) {
    const key = c.content.slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({
        content: c.content,
        source_type: "doc" as const, // Vertical knowledge treated as documents
        source_row_id: c.id,
        metadata: {
          ...(typeof c.metadata === "object" && c.metadata !== null
            ? c.metadata
            : {}),
          vertical_knowledge: true,
          vertical: vertical,
        },
        similarity: c.similarity + tagBoost, // Apply TAG_BOOST to vertical chunks
        tags: [],
        priority: 1.2, // Slightly higher than normal chunks but lower than thread attachments
      });
    }
  }

  // Process deal-specific chunks (medium priority)
  for (const c of dealRes.data ?? []) {
    const key = c.content.slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ ...c, priority: 1.0 });
    }
  }

  // Process global chunks (lowest priority)
  for (const c of globalRes.data ?? []) {
    const key = c.content.slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ ...c, priority: 1.0 });
    }
  }

  // Sort by combined score (similarity * priority)
  merged.sort((a, b) => {
    const scoreA = a.similarity * (a.priority || 1.0);
    const scoreB = b.similarity * (b.priority || 1.0);
    return scoreB - scoreA;
  });

  const final: ContextChunk[] = [];
  let tokenTally = 0;
  for (const c of merged) {
    const tokens = Math.ceil(c.content.length / 4);
    if (tokenTally + tokens > maxTokens) break;
    tokenTally += tokens;
    final.push({ ...c, tokens });
  }

  return final;
}

// Intelligent memory management with importance-based selection
export async function getIntelligentThreadHistory(
  supabase: SupabaseClient,
  threadId: string,
  maxTokens: number = 2000,
): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
  // Get extended history for analysis
  const { data: allMessages } = await supabase
    .from("chat_messages")
    .select("role, content, metadata, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(50); // Analyze up to 50 messages

  if (!allMessages?.length) return [];

  // Score messages by importance
  const scoredMessages = allMessages.map((msg) => ({
    ...msg,
    tokens: Math.ceil(msg.content.length / 4),
    importance: 1.0, // Simple importance score since calculateMessageImportance was removed
  }));

  // Always include recent messages (last 4)
  const recentMessages = scoredMessages.slice(-4);
  const selectedMessages = [...recentMessages];
  let tokenCount = recentMessages.reduce((sum, msg) => sum + msg.tokens, 0);

  // Add high-importance older messages if tokens allow
  const olderMessages = scoredMessages
    .slice(0, -4)
    .sort((a, b) => b.importance - a.importance);

  for (const msg of olderMessages) {
    if (tokenCount + msg.tokens <= maxTokens) {
      selectedMessages.unshift(msg);
      tokenCount += msg.tokens;
    }
  }

  // Sort chronologically and return
  return selectedMessages
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
}

// Build context message with enhanced no-context strategy
export function buildContextMessage(
  chunks: ContextChunk[],
  query: string,
): { role: "user"; content: string } {
  if (chunks.length === 0) {
    return {
      role: "user",
      content: `## Context Status
No specific context was found for this query.

## Guidance for Helpful Response:
1. Acknowledge the lack of specific information
2. If the query is about deals/documents, suggest:
   - Checking if the deal ID is correct
   - Searching with different keywords
   - Asking more specific questions
3. For general business/sales questions, provide helpful general guidance
4. Ask clarifying questions to better understand needs
5. Suggest specific follow-up actions

## User Query:
Query: "${query}"`,
    };
  }

  // Simple context formatting since formatContextWithPriority was removed
  let context = "## Context\n\n";
  chunks.forEach((chunk, index) => {
    context += `${index + 1}. ${chunk.content.trim()}\n`;
  });

  return {
    role: "user",
    content: context,
  };
}

// Helper function to generate embeddings (extracted for reuse)
export async function generateEmbedding(text: string): Promise<number[]> {
  const openaiKey = process.env.OPENAI_API_KEY!;
  if (!openaiKey) throw new Error("OpenAI API key not configured");

  const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });

  if (!embedRes.ok) {
    const err = await embedRes.text();
    throw new Error(`Embedding failed: ${embedRes.status} ${err}`);
  }

  const embedData = await embedRes.json();
  return embedData.data[0].embedding;
}
