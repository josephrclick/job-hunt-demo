import { createServiceRoleClient } from '@/lib/supabase/server';
import { Database } from '@/supabase/supabase.generated';

export type AuditEventType = 
  | 'ENRICHMENT_START'
  | 'ENRICHMENT_COMPLETE'
  | 'ENRICHMENT_FAILED'
  | 'VALIDATION_WARNING'
  | 'VALIDATION_ERROR'
  | 'RETRY_ATTEMPT'
  | 'PARTIAL_SUCCESS'
  | 'DIMENSIONAL_SCORE_CALCULATED'
  | 'RISK_DETECTED'
  | 'PROMPT_VERSION_USED'
  | 'USER_PROFILE_LOADED'
  | 'PROMPT_GENERATED'
  | 'OPENAI_RESPONSE_RECEIVED'
  | 'RESPONSE_VALIDATION_SUCCESS'
  | 'RESPONSE_VALIDATION_FAILED'
  | 'RISK_ANALYSIS_COMPLETE'
  | 'DIMENSIONAL_SCORES_CALCULATED';

export interface AuditEvent {
  job_id: string;
  event_type: AuditEventType;
  event_data: Record<string, any>;
  correlation_id?: string;
  user_id?: string;
  created_at?: string;
}

export interface EnrichmentAuditTrail {
  job_id: string;
  correlation_id: string;
  start_time: Date;
  events: AuditEvent[];
  metadata: {
    prompt_version?: string;
    model_used?: string;
    total_tokens?: number;
    retry_count?: number;
    validation_warnings?: string[];
    dimensional_scores?: Record<string, number>;
  };
}

export class EnrichmentAuditor {
  private trail: EnrichmentAuditTrail;
  private supabase: ReturnType<typeof createServiceRoleClient>;

  constructor(jobId: string, correlationId: string) {
    this.trail = {
      job_id: jobId,
      correlation_id: correlationId,
      start_time: new Date(),
      events: [],
      metadata: {}
    };
    this.supabase = createServiceRoleClient();
  }

  async recordEvent(eventType: AuditEventType, eventData: Record<string, any>) {
    const event: AuditEvent = {
      job_id: this.trail.job_id,
      event_type: eventType,
      event_data: {
        ...eventData,
        timestamp: new Date().toISOString()
      },
      correlation_id: this.trail.correlation_id,
      created_at: new Date().toISOString()
    };

    this.trail.events.push(event);

    // Log critical events to database
    if (this.shouldPersistEvent(eventType)) {
      await this.persistEvent(event);
    }
  }

  updateMetadata(metadata: Partial<EnrichmentAuditTrail['metadata']>) {
    this.trail.metadata = {
      ...this.trail.metadata,
      ...metadata
    };
  }

  async complete(success: boolean, summary?: Record<string, any>) {
    const duration = Date.now() - this.trail.start_time.getTime();
    
    await this.recordEvent(
      success ? 'ENRICHMENT_COMPLETE' : 'ENRICHMENT_FAILED',
      {
        duration_ms: duration,
        event_count: this.trail.events.length,
        ...summary
      }
    );

    // Persist the complete trail
    await this.persistTrail();
  }

  getTrail(): EnrichmentAuditTrail {
    return { ...this.trail };
  }

  private shouldPersistEvent(eventType: AuditEventType): boolean {
    const criticalEvents: AuditEventType[] = [
      'ENRICHMENT_FAILED',
      'VALIDATION_ERROR',
      'RISK_DETECTED'
    ];
    return criticalEvents.includes(eventType);
  }

  private async persistEvent(event: AuditEvent) {
    // TODO: enrichment_audit_events table doesn't exist yet
    // try {
    //   await this.supabase
    //     .from('enrichment_audit_events')
    //     .insert({
    //       job_id: event.job_id,
    //       event_type: event.event_type,
    //       event_data: event.event_data,
    //       correlation_id: event.correlation_id,
    //       created_at: event.created_at
    //     });
    // } catch (error) {
    //   console.error('Failed to persist audit event:', error);
    // }
  }

  private async persistTrail() {
    try {
      const trailSummary = {
        job_id: this.trail.job_id,
        correlation_id: this.trail.correlation_id,
        start_time: this.trail.start_time.toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: Date.now() - this.trail.start_time.getTime(),
        event_count: this.trail.events.length,
        metadata: this.trail.metadata,
        success: this.trail.events.some(e => e.event_type === 'ENRICHMENT_COMPLETE'),
        error_count: this.trail.events.filter(e => 
          e.event_type === 'ENRICHMENT_FAILED' || 
          e.event_type === 'VALIDATION_ERROR'
        ).length,
        retry_count: this.trail.metadata.retry_count || 0
      };

      // TODO: enrichment_audit_trails table doesn't exist yet
      // await this.supabase
      //   .from('enrichment_audit_trails')
      //   .insert(trailSummary);
    } catch (error) {
      console.error('Failed to persist audit trail:', error);
    }
  }
}

// Helper function to create audit trail migration
export const auditTrailMigration = `
-- Create audit tables
CREATE TABLE IF NOT EXISTS enrichment_audit_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  correlation_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrichment_audit_trails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  correlation_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER NOT NULL,
  event_count INTEGER NOT NULL,
  metadata JSONB,
  success BOOLEAN NOT NULL,
  error_count INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_events_job_id ON enrichment_audit_events(job_id);
CREATE INDEX idx_audit_events_type ON enrichment_audit_events(event_type);
CREATE INDEX idx_audit_events_created ON enrichment_audit_events(created_at DESC);
CREATE INDEX idx_audit_trails_job_id ON enrichment_audit_trails(job_id);
CREATE INDEX idx_audit_trails_correlation ON enrichment_audit_trails(correlation_id);
CREATE INDEX idx_audit_trails_success ON enrichment_audit_trails(success);

-- Grant permissions
GRANT SELECT ON enrichment_audit_events TO authenticated;
GRANT SELECT ON enrichment_audit_trails TO authenticated;
`;