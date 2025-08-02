import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InterviewRoundUpdate } from '@/types/interview';

// GET /api/jobs/[id]/interviews/[roundId] - Get a specific interview round
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const { id: jobId, roundId } = await params;
    
    // Validate IDs
    if (!jobId || !roundId) {
      return NextResponse.json(
        { error: 'Invalid job ID or round ID' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get the interview round
    const { data: round, error } = await supabase
      .from('interview_rounds')
      .select('*')
      .eq('id', roundId)
      .eq('job_id', jobId)
      .single();

    if (error || !round) {
      return NextResponse.json(
        { error: 'Interview round not found' },
        { status: 404 }
      );
    }

    // Get related notes
    const { data: notes } = await supabase
      .from('job_notes')
      .select('*')
      .eq('job_id', jobId)
      .eq('note_type', `interview_round_${roundId}`)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      round: {
        ...round,
        notes: notes || []
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/jobs/[id]/interviews/[roundId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id]/interviews/[roundId] - Update an interview round
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const { id: jobId, roundId } = await params;
    
    // Validate IDs
    if (!jobId || !roundId) {
      return NextResponse.json(
        { error: 'Invalid job ID or round ID' },
        { status: 400 }
      );
    }

    // Parse request body
    let body: InterviewRoundUpdate;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
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

    // Update the interview round
    const { data: round, error: updateError } = await supabase
      .from('interview_rounds')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', roundId)
      .eq('job_id', jobId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating interview round:', updateError);
      
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Interview round not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update interview round' },
        { status: 500 }
      );
    }

    // If marking as completed with a positive outcome, consider auto-creating next round
    if (body.status === 'completed' && 
        (body.outcome === 'passed' || body.outcome === 'yes' || body.outcome === 'strong_yes')) {
      
      const { getNextInterviewStage } = await import('@/types/interview');
      const nextStage = getNextInterviewStage(round.stage);
      
      if (nextStage !== round.stage && nextStage !== 'completed') {
        // Check if next round already exists
        const { data: existingNextRound } = await supabase
          .from('interview_rounds')
          .select('id')
          .eq('job_id', jobId)
          .eq('round_number', round.round_number + 1)
          .single();

        if (!existingNextRound) {
          // Auto-create next round
          await supabase
            .from('interview_rounds')
            .insert({
              job_id: jobId,
              profile_uid: user.id,
              round_number: round.round_number + 1,
              stage: nextStage,
              status: 'scheduled'
            });
        }
      }
    }

    return NextResponse.json({
      success: true,
      round,
      message: 'Interview round updated successfully'
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/jobs/[id]/interviews/[roundId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id]/interviews/[roundId] - Delete an interview round
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const { id: jobId, roundId } = await params;
    
    // Validate IDs
    if (!jobId || !roundId) {
      return NextResponse.json(
        { error: 'Invalid job ID or round ID' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Delete the interview round
    const { error: deleteError } = await supabase
      .from('interview_rounds')
      .delete()
      .eq('id', roundId)
      .eq('job_id', jobId);

    if (deleteError) {
      console.error('Error deleting interview round:', deleteError);
      
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Interview round not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to delete interview round' },
        { status: 500 }
      );
    }

    // Delete related notes
    await supabase
      .from('job_notes')
      .delete()
      .eq('job_id', jobId)
      .eq('note_type', `interview_round_${roundId}`);

    return NextResponse.json({
      success: true,
      message: 'Interview round deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/jobs/[id]/interviews/[roundId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}