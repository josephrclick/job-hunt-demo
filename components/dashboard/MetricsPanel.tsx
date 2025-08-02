'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Users, 
  Server, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain
} from 'lucide-react';

interface MetricsData {
  timestamp: string;
  database: {
    active_connections: number;
    connection_limit: number;
    cache_hit_ratio: number;
  };
  jobs: {
    total_jobs: number;
    jobs_today: number;
    enriched_jobs: number;
    enrichment_success_rate: number;
  };
  enrichment: {
    processed_today: number;
    queue_length: number;
    avg_processing_time: number;
    failed_today: number;
  };
  api: {
    response_time_p95: number;
    error_rate: number;
    requests_per_minute: number;
  };
  system: {
    uptime: number;
    memory_usage: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
    node_version: string;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  color?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
}

function MetricCard({ title, value, icon, trend, subtitle, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className={`text-xs px-2 py-1 rounded ${
              trend === 'up' ? 'bg-green-100 text-green-700' :
              trend === 'down' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data);
      
      // Add to historical data for charts (keep last 20 points)
      setHistoricalData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString(),
          connections: data.database.active_connections,
          responseTime: data.api.response_time_p95,
          jobs: data.jobs.jobs_today,
          errorRate: data.api.error_rate * 100
        }];
        return newData.slice(-20);
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Set up polling for real-time updates
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">Error loading metrics: {error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">System Metrics</h2>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Top Row - Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Active Connections"
          value={metrics.database.active_connections}
          icon={<Database className="h-6 w-6" />}
          subtitle={`${((metrics.database.active_connections / metrics.database.connection_limit) * 100).toFixed(1)}% of limit`}
          color="blue"
        />
        
        <MetricCard
          title="Jobs Today"
          value={metrics.jobs.jobs_today}
          icon={<TrendingUp className="h-6 w-6" />}
          subtitle={`${metrics.jobs.enriched_jobs} enriched`}
          color="green"
        />
        
        <MetricCard
          title="API Response Time"
          value={`${metrics.api.response_time_p95.toFixed(0)}ms`}
          icon={<Zap className="h-6 w-6" />}
          subtitle="95th percentile"
          color="orange"
        />
        
        <MetricCard
          title="System Uptime"
          value={formatUptime(metrics.system.uptime)}
          icon={<Server className="h-6 w-6" />}
          subtitle={metrics.system.node_version}
          color="purple"
        />
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Real-time Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Response Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Processing Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Job Processing Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Processed Today</span>
                <Badge variant="secondary">{metrics.enrichment.processed_today}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Queue Length</span>
                <Badge variant={metrics.enrichment.queue_length > 10 ? "destructive" : "secondary"}>
                  {metrics.enrichment.queue_length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg Processing Time</span>
                <Badge variant="outline">{metrics.enrichment.avg_processing_time.toFixed(1)}s</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Failed Today</span>
                <Badge variant={metrics.enrichment.failed_today > 0 ? "destructive" : "secondary"}>
                  {metrics.enrichment.failed_today}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Database Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Database Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Cache Hit Ratio</span>
                <span className="font-medium">{(metrics.database.cache_hit_ratio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Jobs</span>
                <span className="font-medium">{metrics.jobs.total_jobs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Enrichment Rate</span>
                <span className="font-medium">{metrics.jobs.enrichment_success_rate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Requests/min</span>
                <span className="font-medium">{metrics.api.requests_per_minute}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Error Rate</span>
                <span className={`font-medium ${metrics.api.error_rate > 0.05 ? 'text-red-500' : 'text-green-500'}`}>
                  {(metrics.api.error_rate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={metrics.api.error_rate < 0.01 ? "default" : "destructive"}>
                  {metrics.api.error_rate < 0.01 ? "Healthy" : "Degraded"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Memory (RSS)</span>
                <span className="font-medium">{formatBytes(metrics.system.memory_usage.rss)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Heap Used</span>
                <span className="font-medium">{formatBytes(metrics.system.memory_usage.heapUsed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last Updated</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(metrics.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}