/**
 * Central schema & type definitions.
 *
 * - Supabase table row types imported from generated types
 * - Zod schemas enable runtime validation & type inference
 */
import { z } from "zod";
import type { Database } from "../../supabase/supabase.generated";

// Job-focused Architecture Types (only keep the used ones)
export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobEnrichment = Database["public"]["Tables"]["job_enrichments"]["Row"];



export const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
});
export type Env = z.infer<typeof EnvSchema>;

