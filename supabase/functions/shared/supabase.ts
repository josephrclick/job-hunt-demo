import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export interface SupabaseConfig {
  url: string
  serviceRoleKey: string
  anonKey?: string
}

export const createServiceRoleClient = (): SupabaseClient => {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!url || !serviceRoleKey) {
    throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
  
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const createAnonClient = (): SupabaseClient => {
  const url = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  
  if (!url || !anonKey) {
    throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY')
  }
  
  return createClient(url, anonKey)
}