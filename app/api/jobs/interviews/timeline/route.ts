import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/jobs/interviews/timeline - Get upcoming interviews across all jobs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const status = searchParams.get('status') || 'scheduled';

    // Create Supabase client
    const supabase = await createClient();

    // Calculate date range
    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    // Build query
    let query = supabase
      .from('interview_rounds')
      .select(`
        *,
        job:jobs!inner(
          id,
          title,
          company,
          location,
          current_interview_stage,
          interview_status
        )
      `)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate.toISOString())
      .order('scheduled_date', { ascending: true });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: interviews, error } = await query;

    if (error) {
      console.error('Error fetching interview timeline:', error);
      return NextResponse.json(
        { error: 'Failed to fetch interview timeline' },
        { status: 500 }
      );
    }

    // Group interviews by date
    const timeline = interviews.reduce((acc: any, interview: any) => {
      if (!interview.scheduled_date) return acc;
      
      const date = new Date(interview.scheduled_date).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          interviews: []
        };
      }
      
      acc[date].interviews.push({
        ...interview,
        job: interview.job // Flatten the job data
      });
      
      return acc;
    }, {});

    // Convert to array and sort by date
    const timelineArray = Object.values(timeline).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Get summary statistics
    const stats = {
      total: interviews.length,
      byStatus: interviews.reduce((acc: any, interview: any) => {
        acc[interview.status] = (acc[interview.status] || 0) + 1;
        return acc;
      }, {}),
      byStage: interviews.reduce((acc: any, interview: any) => {
        acc[interview.stage] = (acc[interview.stage] || 0) + 1;
        return acc;
      }, {}),
      nextInterview: interviews[0] || null
    };

    return NextResponse.json({
      success: true,
      timeline: timelineArray,
      stats,
      dateRange: {
        start: startDate,
        end: endDate.toISOString(),
        days
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/jobs/interviews/timeline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}