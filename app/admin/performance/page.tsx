'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Clock, Cpu, Database } from 'lucide-react';
import type { PerformanceReport, BenchmarkResult } from '@/lib/performance/benchmarks';

export default function PerformanceMonitoringPage() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    fetchPerformanceReport();
    const interval = setInterval(fetchPerformanceReport, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchPerformanceReport = async () => {
    try {
      const response = await fetch(`/api/admin/performance?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch performance report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching performance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (value: number, threshold: number) => {
    if (value < threshold * 0.8) return 'text-green-600';
    if (value < threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (value: number, threshold: number) => {
    if (value < threshold * 0.8) return <Badge variant="default">Good</Badge>;
    if (value < threshold) return <Badge variant="default">Warning</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading performance metrics...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load performance report</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Alerts Section */}
      {report.alerts.length > 0 && (
        <div className="space-y-2">
          {report.alerts.map((alert, idx) => (
            <Alert key={idx} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.type.replace(/_/g, ' ').toUpperCase()}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(report.summary.totalRequests)}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === '1h' ? 'per hour' : timeRange === '24h' ? 'per day' : 'per week'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            {report.summary.errorRate > 5 ? (
              <TrendingUp className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(report.summary.errorRate, 5)}`}>
              {report.summary.errorRate.toFixed(2)}%
            </div>
            <Progress value={report.summary.errorRate} max={10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(report.summary.avgResponseTime, 3000)}`}>
              {formatDuration(report.summary.avgResponseTime)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              P95: {formatDuration(report.summary.p95ResponseTime)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(report.tokenUsage.total)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(report.tokenUsage.avgPerRequest)} avg/request
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="tokens">Token Usage</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Performance</CardTitle>
              <CardDescription>Response time metrics by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(report.apiMetrics).map(([endpoint, metrics]) => (
                  <div key={endpoint} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{endpoint}</span>
                      <span className="text-sm text-muted-foreground">
                        {metrics.iterations} requests
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Min: </span>
                        <span className="font-medium">{formatDuration(metrics.metrics.min)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg: </span>
                        <span className="font-medium">{formatDuration(metrics.metrics.mean)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P95: </span>
                        <span className={`font-medium ${getStatusColor(metrics.metrics.p95, 5000)}`}>
                          {formatDuration(metrics.metrics.p95)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P99: </span>
                        <span className={`font-medium ${getStatusColor(metrics.metrics.p99, 8000)}`}>
                          {formatDuration(metrics.metrics.p99)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Usage by Model</CardTitle>
              <CardDescription>Total tokens consumed per model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(report.tokenUsage.byModel).map(([model, tokens]) => (
                  <div key={model} className="flex justify-between items-center">
                    <span className="font-medium">{model}</span>
                    <div className="text-right">
                      <div className="font-bold">{formatNumber(tokens)}</div>
                      <div className="text-sm text-muted-foreground">
                        ${((tokens / 1000) * 0.0005).toFixed(2)} estimated cost
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Benchmarks</CardTitle>
              <CardDescription>Compare against performance targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Enrichment API</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">P95 Target: 5s</div>
                      <div className="flex items-center gap-2">
                        <span className={getStatusColor(report.summary.p95ResponseTime, 5000)}>
                          {formatDuration(report.summary.p95ResponseTime)}
                        </span>
                        {getStatusBadge(report.summary.p95ResponseTime, 5000)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">P99 Target: 8s</div>
                      <div className="flex items-center gap-2">
                        <span className={getStatusColor(report.summary.p99ResponseTime, 8000)}>
                          {formatDuration(report.summary.p99ResponseTime)}
                        </span>
                        {getStatusBadge(report.summary.p99ResponseTime, 8000)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Token Usage</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Avg per Request Target: 3000</div>
                      <div className="flex items-center gap-2">
                        <span className={getStatusColor(report.tokenUsage.avgPerRequest, 3000)}>
                          {formatNumber(report.tokenUsage.avgPerRequest)}
                        </span>
                        {getStatusBadge(report.tokenUsage.avgPerRequest, 3000)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">System Health</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Error Rate Target: &lt;5%</div>
                      <div className="flex items-center gap-2">
                        <span className={getStatusColor(report.summary.errorRate, 5)}>
                          {report.summary.errorRate.toFixed(2)}%
                        </span>
                        {getStatusBadge(report.summary.errorRate, 5)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}