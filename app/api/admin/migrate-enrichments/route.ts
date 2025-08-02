import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEnrichmentEndpoint } from '@/lib/features/feature-flags';
import { createHash } from 'crypto';
import type { Database } from '@/supabase/supabase.generated';

// Migration state stored in memory (in production, use Redis or DB)
const migrationState = new Map<string, MigrationState>();

interface MigrationState {
  id: string;
  lastProcessedId: string | null;
  totalJobs: number;
  processedJobs: number;
  successCount: number;
  errorCount: number;
  startedAt: string;
  updatedAt: string;
  checkpoints: string[];
  status: 'running' | 'paused' | 'completed' | 'failed';
  errors: Array<{ jobId: string; error: string; timestamp: string }>;
}

const BATCH_SIZE = 10; // Process 10 jobs at a time
const MAX_CONCURRENT = 3; // Max concurrent enrichments
const CHECKPOINT_INTERVAL = 50; // Create checkpoint every 50 jobs

export async function GET(request: NextRequest) {
  // Check admin auth
  const apiKey = request.headers.get('x-internal-api-key');
  if (apiKey !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get migration status
  const migrationId = request.nextUrl.searchParams.get('id');
  if (migrationId) {
    const state = migrationState.get(migrationId);
    if (!state) {
      return NextResponse.json({ error: 'Migration not found' }, { status: 404 });
    }
    return NextResponse.json({ migration: state });
  }

  // List all migrations
  const migrations = Array.from(migrationState.values());
  return NextResponse.json({ migrations });
}

export async function POST(request: NextRequest) {
  // Check admin auth
  const apiKey = request.headers.get('x-internal-api-key');
  if (apiKey !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action, migrationId } = body;

  // Handle pause/resume
  if (action === 'pause' && migrationId) {
    const state = migrationState.get(migrationId);
    if (state) {
      state.status = 'paused';
      return NextResponse.json({ migration: state });
    }
  }

  if (action === 'resume' && migrationId) {
    const state = migrationState.get(migrationId);
    if (state && state.status === 'paused') {
      state.status = 'running';
      // Continue processing from last checkpoint
      processNextBatch(migrationId);
      return NextResponse.json({ migration: state });
    }
  }

  // Start new migration
  const supabase = await createClient();
  
  // Count total jobs needing migration
  const { count, error: countError } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .is('enrichment_id', null);

  if (countError) {
    return NextResponse.json({ error: 'Failed to count jobs' }, { status: 500 });
  }

  const migrationStateId = createHash('md5').update(Date.now().toString()).digest('hex');
  const newState: MigrationState = {
    id: migrationStateId,
    lastProcessedId: null,
    totalJobs: count || 0,
    processedJobs: 0,
    successCount: 0,
    errorCount: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checkpoints: [],
    status: 'running',
    errors: []
  };

  migrationState.set(migrationStateId, newState);

  // Start processing
  setImmediate(() => processNextBatch(migrationStateId));

  return NextResponse.json({ 
    migration: newState,
    message: `Started migration for ${count} jobs`
  });
}

async function processNextBatch(migrationId: string) {
  const state = migrationState.get(migrationId);
  if (!state || state.status !== 'running') return;

  const supabase = await createClient();

  // Get next batch of jobs
  let query = supabase
    .from('jobs')
    .select('*')
    .is('enrichment_id', null)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (state.lastProcessedId) {
    query = query.gt('id', state.lastProcessedId);
  }

  const { data: jobs, error } = await query;

  if (error) {
    state.status = 'failed';
    state.errors.push({
      jobId: 'batch',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (!jobs || jobs.length === 0) {
    // Migration complete
    state.status = 'completed';
    state.updatedAt = new Date().toISOString();
    return;
  }

  // Process jobs with concurrency control
  const chunks = [];
  for (let i = 0; i < jobs.length; i += MAX_CONCURRENT) {
    chunks.push(jobs.slice(i, i + MAX_CONCURRENT));
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (job: Database['public']['Tables']['jobs']['Row']) => {
        try {
          // Call v2 enrichment endpoint
          const enrichResponse = await fetch(getEnrichmentEndpoint(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.EXTENSION_API_KEY!
            },
            body: JSON.stringify({
              title: job.title,
              company: job.company,
              description: job.description,
              url: job.url,
              location: job.location,
              source: job.source,
              scrapedAt: job.scraped_at
            })
          });

          if (!enrichResponse.ok) {
            throw new Error(`Enrichment failed: ${enrichResponse.status}`);
          }

          state.successCount++;
        } catch (error) {
          state.errorCount++;
          state.errors.push({
            jobId: job.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });

          // Continue with next job despite error
        }

        state.processedJobs++;
        state.lastProcessedId = job.id;
        state.updatedAt = new Date().toISOString();

        // Create checkpoint
        if (state.processedJobs % CHECKPOINT_INTERVAL === 0) {
          state.checkpoints.push(`Processed ${state.processedJobs}/${state.totalJobs} at ${new Date().toISOString()}`);
        }
      })
    );
  }

  // Continue with next batch
  if (state.status === 'running') {
    setImmediate(() => processNextBatch(migrationId));
  }
}

export async function DELETE(request: NextRequest) {
  // Check admin auth
  const apiKey = request.headers.get('x-internal-api-key');
  if (apiKey !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const migrationId = request.nextUrl.searchParams.get('id');
  if (!migrationId) {
    return NextResponse.json({ error: 'Migration ID required' }, { status: 400 });
  }

  const deleted = migrationState.delete(migrationId);
  if (!deleted) {
    return NextResponse.json({ error: 'Migration not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Migration deleted' });
}