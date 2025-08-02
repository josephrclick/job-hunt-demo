import { NextRequest, NextResponse } from 'next/server';
import { benchmark, generatePerformanceReport } from '@/lib/performance/benchmarks';

export async function GET(request: NextRequest) {
  // Check authentication (in production, implement proper auth)
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For now, allow access without auth in development
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get time range from query parameters
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get('range') || '24h';

  // Calculate time window
  const now = new Date();
  let start: Date;

  switch (range) {
    case '1h':
      start = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '24h':
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
  }

  try {
    // Generate performance report
    const report = generatePerformanceReport(start, now);

    // Add additional metadata
    const enhancedReport = {
      ...report,
      generatedAt: new Date().toISOString(),
      timeRange: range,
      systemStatus: getSystemStatus(report)
    };

    return NextResponse.json(enhancedReport);
  } catch (error) {
    console.error('Error generating performance report:', error);
    return NextResponse.json(
      { error: 'Failed to generate performance report' },
      { status: 500 }
    );
  }
}

// Get specific metric endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, timeWindow } = body;

    if (!metric) {
      return NextResponse.json(
        { error: 'Metric name is required' },
        { status: 400 }
      );
    }

    const start = timeWindow?.start ? new Date(timeWindow.start) : undefined;
    const end = timeWindow?.end ? new Date(timeWindow.end) : undefined;

    const benchmarkResult = benchmark.getBenchmark(
      metric,
      start && end ? { start, end } : undefined
    );

    if (!benchmarkResult) {
      return NextResponse.json(
        { error: 'No data found for the specified metric' },
        { status: 404 }
      );
    }

    return NextResponse.json(benchmarkResult);
  } catch (error) {
    console.error('Error fetching metric data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metric data' },
      { status: 500 }
    );
  }
}

function getSystemStatus(report: any): 'healthy' | 'warning' | 'critical' {
  // Determine overall system status based on metrics and alerts
  if (report.alerts.some((a: any) => a.severity === 'critical')) {
    return 'critical';
  }
  
  if (report.alerts.length > 0 || report.summary.errorRate > 5) {
    return 'warning';
  }
  
  return 'healthy';
}