import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Basic health check - verify database connectivity
    const supabase = createServiceRoleClient();
    
    // Simple query to test database connectivity
    const { error } = await supabase
      .from('user_profile')
      .select('count')
      .limit(1);
    
    if (error) {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          timestamp: new Date().toISOString(),
          database: 'error',
          error: error.message 
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || 'unknown'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}