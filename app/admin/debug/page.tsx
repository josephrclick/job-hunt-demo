'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface PipelineTrace {
  id: string;
  correlation_id: string | null;
  service_name: string;
  operation: string;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  metadata: any;
  created_at: string | null;
  job_id?: string | null;
  worker_id?: string | null;
}

interface EnrichmentAuditEvent {
  id: string;
  job_id: string;
  event_type: string;
  event_data: any;
  correlation_id: string | null;
  user_id: string | null;
  created_at: string | null;
}

interface PerformanceMetric {
  key: string;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  count: number;
}

export default function DebugPage() {
  const [traces, setTraces] = useState<PipelineTrace[]>([]);
  const [auditEvents, setAuditEvents] = useState<EnrichmentAuditEvent[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, PerformanceMetric>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [correlationIdFilter, setCorrelationIdFilter] = useState('');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');
  
  const supabase = createClient();

  const fetchData = async () => {
    try {
      // Calculate time filter
      const now = new Date();
      const startTime = new Date();
      if (timeRange === '1h') {
        startTime.setHours(now.getHours() - 1);
      } else if (timeRange === '24h') {
        startTime.setDate(now.getDate() - 1);
      } else {
        startTime.setDate(now.getDate() - 7);
      }

      // Fetch pipeline traces
      let tracesQuery = supabase
        .from('pipeline_traces')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (correlationIdFilter) {
        tracesQuery = tracesQuery.eq('correlation_id', correlationIdFilter);
      }

      const { data: tracesData, error: tracesError } = await tracesQuery;
      if (tracesError) throw tracesError;
      setTraces(tracesData || []);

      // Fetch enrichment audit events
      // TODO: enrichment_audit_events table doesn't exist yet
      // const auditQuery = supabase
      //   .from('enrichment_audit_events')
      //   .select('*')
      //   .gte('created_at', startTime.toISOString())
      //   .order('created_at', { ascending: false })
      //   .limit(100);

      // const { data: auditData, error: auditError } = await auditQuery;
      // if (auditError) throw auditError;
      setAuditEvents([]);

      // Calculate performance metrics from traces
      const metrics: Record<string, number[]> = {};
      tracesData?.forEach(trace => {
        if (trace.duration_ms) {
          const key = `${trace.service_name}.${trace.operation}`;
          if (!metrics[key]) metrics[key] = [];
          metrics[key].push(trace.duration_ms);
        }
      });

      const calculatedMetrics: Record<string, PerformanceMetric> = {};
      Object.entries(metrics).forEach(([key, values]) => {
        values.sort((a, b) => a - b);
        const count = values.length;
        calculatedMetrics[key] = {
          key,
          mean: values.reduce((a, b) => a + b, 0) / count,
          median: values[Math.floor(count / 2)],
          p95: values[Math.floor(count * 0.95)],
          p99: values[Math.floor(count * 0.99)],
          min: values[0],
          max: values[count - 1],
          count
        };
      });
      setPerformanceMetrics(calculatedMetrics);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [correlationIdFilter, timeRange, autoRefresh]);

  const formatJson = (data: any) => {
    if (!data) return 'null';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-6 bg-background">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Debug Dashboard</h1>
      
      {/* Controls */}
      <div className="mb-6 space-y-4 bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-border"
            />
            Auto-refresh (5s)
          </label>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
            className="border border-border rounded px-2 py-1 bg-background text-foreground text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <button
            onClick={fetchData}
            className="px-4 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4 border border-destructive/20">
          Error: {error}
        </div>
      )}

      {loading && !traces.length ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <>
          {/* Performance Metrics */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Performance Metrics</h2>
            <div className="bg-card p-4 rounded-lg border border-border overflow-auto">
              <table className="text-sm w-full text-foreground">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="pr-4 pb-2 font-medium">Event</th>
                    <th className="pr-4 pb-2 font-medium">Count</th>
                    <th className="pr-4 pb-2 font-medium">Mean</th>
                    <th className="pr-4 pb-2 font-medium">Median</th>
                    <th className="pr-4 pb-2 font-medium">P95</th>
                    <th className="pr-4 pb-2 font-medium">P99</th>
                    <th className="pr-4 pb-2 font-medium">Min</th>
                    <th className="pr-4 pb-2 font-medium">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(performanceMetrics).map(metric => (
                    <tr key={metric.key} className="border-b border-border/50 last:border-0">
                      <td className="pr-4 py-2 font-mono text-sm">{metric.key}</td>
                      <td className="pr-4 py-2">{metric.count}</td>
                      <td className="pr-4 py-2">{Math.round(metric.mean)}ms</td>
                      <td className="pr-4 py-2">{Math.round(metric.median)}ms</td>
                      <td className="pr-4 py-2">{Math.round(metric.p95)}ms</td>
                      <td className="pr-4 py-2">{Math.round(metric.p99)}ms</td>
                      <td className="pr-4 py-2">{Math.round(metric.min)}ms</td>
                      <td className="pr-4 py-2">{Math.round(metric.max)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pipeline Traces */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Pipeline Traces ({traces.length})</h2>
            <div className="space-y-2">
              {traces.map(trace => (
                <div key={trace.id} className="bg-card p-4 rounded-lg border border-border text-sm font-mono">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-foreground">{trace.operation}</span>
                      <span className="ml-2 text-muted-foreground">({trace.service_name})</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        trace.status === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        trace.status === 'failure' ? 'bg-destructive/10 text-destructive' :
                        'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {trace.status}
                      </span>
                      {trace.duration_ms && (
                        <span className="ml-2 text-muted-foreground">{trace.duration_ms}ms</span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {trace.created_at ? format(new Date(trace.created_at), 'HH:mm:ss.SSS') : 'N/A'}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Correlation ID: {trace.correlation_id || 'N/A'}
                  </div>
                  {trace.error_message && (
                    <div className="mt-2 text-destructive text-sm">
                      Error: {trace.error_message}
                    </div>
                  )}
                  {trace.metadata && Object.keys(trace.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-primary hover:underline">Metadata</summary>
                      <pre className="mt-1 text-sm overflow-auto bg-muted/50 p-2 rounded text-muted-foreground">{formatJson(trace.metadata)}</pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Enrichment Audit Events */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Enrichment Audit Events ({auditEvents.length})</h2>
            <div className="space-y-2">
              {auditEvents.map(event => (
                <div key={event.id} className="bg-card p-4 rounded-lg border border-border text-sm font-mono">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-foreground">{event.event_type}</span>
                      {event.job_id && (
                        <span className="ml-2 text-muted-foreground">Job: {event.job_id}</span>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {event.created_at ? format(new Date(event.created_at), 'HH:mm:ss.SSS') : 'N/A'}
                    </div>
                  </div>
                  {event.correlation_id && (
                    <div className="text-xs text-muted-foreground">
                      Correlation ID: {event.correlation_id}
                    </div>
                  )}
                  {event.event_data && Object.keys(event.event_data).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-primary hover:underline">Event Data</summary>
                      <pre className="mt-1 text-sm overflow-auto bg-muted/50 p-2 rounded text-muted-foreground">{formatJson(event.event_data)}</pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}