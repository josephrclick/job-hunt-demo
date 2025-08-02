import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InterviewRoundInsert } from '@/types/interview';

// GET /api/jobs/[id]/interviews - Get all interview rounds for a job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    // Validate job ID format
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get all interview rounds for the job
    const { data: rounds, error } = await supabase
      .from('interview_rounds')
      .select('*')
      .eq('job_id', jobId)
      .order('round_number', { ascending: true });

    if (error) {
      console.error('Error fetching interview rounds:', error);
      return NextResponse.json(
        { error: 'Failed to fetch interview rounds' },
        { status: 500 }
      );
    }

    // Get related notes from job_notes table
    const roundIds = rounds.map(r => r.id);
    const { data: notes } = await supabase
      .from('job_notes')
      .select('*')
      .eq('job_id', jobId)
      .in('note_type', roundIds.map(id => `interview_round_${id}`))
      .order('created_at', { ascending: false });

    // Map notes to rounds
    const roundsWithNotes = rounds.map(round => ({
      ...round,
      notes: notes?.filter(note => note.note_type === `interview_round_${round.id}`) || []
    }));

    return NextResponse.json({
      success: true,
      rounds: roundsWithNotes
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/jobs/[id]/interviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs/[id]/interviews - Create a new interview round
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    
    // Validate job ID format
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Parse request body
    let body: InterviewRoundInsert;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.round_number || !body.stage) {
      return NextResponse.json(
        { error: 'Missing required fields: round_number and stage' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Create the interview round
    const { data: round, error: insertError } = await supabase
      .from('interview_rounds')
      .insert({
        ...body,
        job_id: jobId,
        profile_uid: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating interview round:', insertError);
      
      if (insertError.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: `Round ${body.round_number} already exists for this job` },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create interview round' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      round,
      message: 'Interview round created successfully'
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/jobs/[id]/interviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}