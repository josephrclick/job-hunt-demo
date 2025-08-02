'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import {
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Building,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  InterviewRound,
  InterviewStage,
  InterviewFormat,
  InterviewOutcome,
  InterviewRoundStatus,
  INTERVIEW_TEMPLATES,
  getStageLabel,
  getStatusColor,
  getOutcomeColor,
  getNextInterviewStage
} from '@/types/interview';
import {
  useInterviewRounds,
  useCreateInterviewRound,
  useUpdateInterviewRound,
  useDeleteInterviewRound,
  useBulkInterviewOperations
} from '@/hooks/useInterviews';

interface InterviewTrackerProps {
  jobId: string;
  jobTitle: string;
  company: string;
  currentStage?: InterviewStage;
  interviewStatus?: string;
}

const formatIcons: Record<InterviewFormat, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  onsite: <Building className="h-4 w-4" />,
  take_home: <FileText className="h-4 w-4" />,
  panel: <Users className="h-4 w-4" />,
  casual: <Briefcase className="h-4 w-4" />
};

const outcomeIcons: Record<string, React.ReactNode> = {
  passed: <CheckCircle className="h-4 w-4 text-green-600" />,
  failed: <XCircle className="h-4 w-4 text-red-600" />,
  pending: <AlertCircle className="h-4 w-4 text-yellow-600" />
};

export function InterviewTracker({
  jobId,
  jobTitle,
  company,
  currentStage = 'not_started',
  interviewStatus = 'not_applied'
}: InterviewTrackerProps) {
  const { rounds, isLoading, refetch } = useInterviewRounds(jobId);
  const { createRound, isCreating } = useCreateInterviewRound(jobId);
  const { deleteRound, isDeleting } = useDeleteInterviewRound(jobId);
  const { applyTemplate } = useBulkInterviewOperations(jobId);
  
  const [selectedRound, setSelectedRound] = useState<InterviewRound | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('rounds');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-8 to jump to round
      if (e.key >= '1' && e.key <= '8' && !e.ctrlKey && !e.metaKey) {
        const roundNumber = parseInt(e.key);
        const round = rounds.find(r => r.round_number === roundNumber);
        if (round) {
          setSelectedRound(round);
          setActiveTab('details');
        }
      }
      
      // Cmd/Ctrl + N for new round
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsAddDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rounds]);

  const handleApplyTemplate = async (templateName: string) => {
    try {
      await applyTemplate(templateName as any);
      await refetch();
      toast.success(`Applied ${templateName} interview template`);
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const upcomingRounds = rounds.filter(r => 
    r.status === 'scheduled' && 
    r.scheduled_date && 
    new Date(r.scheduled_date) > new Date()
  );

  const completedRounds = rounds.filter(r => r.status === 'completed');
  const nextRound = upcomingRounds.sort((a, b) => 
    new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime()
  )[0];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading interviews...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Interview Progress</CardTitle>
              <CardDescription>
                {jobTitle} at {company}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{getStageLabel(currentStage)}</Badge>
              <Badge>{interviewStatus}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{rounds.length}</div>
              <div className="text-sm text-muted-foreground">Total Rounds</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{completedRounds.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{upcomingRounds.length}</div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {completedRounds.filter(r => 
                  ['passed', 'yes', 'strong_yes'].includes(r.outcome || '')
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
          </div>

          {nextRound && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Next Interview</div>
                  <div className="text-sm text-muted-foreground">
                    {getStageLabel(nextRound.stage)} - {format(new Date(nextRound.scheduled_date!), 'PPp')}
                  </div>
                </div>
                {nextRound.meeting_link && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={nextRound.meeting_link} target="_blank" rel="noopener noreferrer">
                      Join Meeting
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Interview Rounds</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Round
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Interview Round</DialogTitle>
                  <DialogDescription>
                    Choose a template or create a custom round
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Quick Templates</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {INTERVIEW_TEMPLATES.map((template) => (
                        <Button
                          key={template.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyTemplate(template.name)}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <AddRoundForm
                    jobId={jobId}
                    nextRoundNumber={rounds.length + 1}
                    onSuccess={() => {
                      setIsAddDialogOpen(false);
                      refetch();
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rounds">All Rounds</TabsTrigger>
              <TabsTrigger value="details">Round Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rounds" className="space-y-2">
              {rounds.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No interview rounds yet. Add your first round to get started.
                </div>
              ) : (
                rounds.map((round) => (
                  <RoundCard
                    key={round.id}
                    round={round}
                    isSelected={selectedRound?.id === round.id}
                    onSelect={() => {
                      setSelectedRound(round);
                      setActiveTab('details');
                    }}
                    onDelete={() => {
                      deleteRound(round.id).then(() => refetch());
                    }}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="details">
              {selectedRound ? (
                <RoundDetails
                  round={selectedRound}
                  jobId={jobId}
                  onUpdate={() => refetch()}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a round to view details
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Round Card Component
function RoundCard({
  round,
  isSelected,
  onSelect,
  onDelete
}: {
  round: InterviewRound;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const statusColor = getStatusColor(round.status as InterviewRoundStatus);
  const outcomeColor = getOutcomeColor(round.outcome as InterviewOutcome | null);

  return (
    <div
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-colors",
        isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-bold">
            {round.round_number}
          </div>
          <div>
            <div className="font-medium">{getStageLabel(round.stage)}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {round.interview_format && formatIcons[round.interview_format as InterviewFormat]}
              {round.scheduled_date && (
                <span>{format(new Date(round.scheduled_date), 'PPp')}</span>
              )}
              {round.duration_minutes && (
                <span>• {round.duration_minutes} min</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn(`bg-${statusColor}-100 text-${statusColor}-700`)}>
            {round.status}
          </Badge>
          {round.outcome && (
            <Badge variant="outline" className={cn(`border-${outcomeColor}-500 text-${outcomeColor}-700`)}>
              {round.outcome}
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Round Details Component
function RoundDetails({
  round,
  jobId,
  onUpdate
}: {
  round: InterviewRound;
  jobId: string;
  onUpdate: () => void;
}) {
  const { update, isUpdating } = useUpdateInterviewRound(jobId, round.id);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(round);

  const handleSave = async () => {
    try {
      await update(formData, round);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Round {round.round_number}: {getStageLabel(round.stage)}
        </h3>
        <Button
          size="sm"
          variant={isEditing ? "default" : "outline"}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isUpdating}
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
      </div>

      <div className="grid gap-4">
        {/* Status and Outcome */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as InterviewRoundStatus })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Outcome</Label>
            <Select
              value={formData.outcome || ''}
              onValueChange={(value) => setFormData({ ...formData, outcome: value as InterviewOutcome })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strong_yes">Strong Yes</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="strong_no">Strong No</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interview Details */}
        <div className="space-y-4">
          <div>
            <Label>Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduled_date && "text-muted-foreground"
                  )}
                  disabled={!isEditing}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_date ? (
                    format(new Date(formData.scheduled_date), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduled_date ? new Date(formData.scheduled_date) : undefined}
                  onSelect={(date) => setFormData({ ...formData, scheduled_date: date?.toISOString() ?? null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Format</Label>
              <Select
                value={formData.interview_format || ''}
                onValueChange={(value) => setFormData({ ...formData, interview_format: value as InterviewFormat })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                  <SelectItem value="take_home">Take Home</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                  <SelectItem value="casual">Casual Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || null })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label>Meeting Link</Label>
            <Input
              value={formData.meeting_link || ''}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              placeholder="https://..."
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Office address or remote"
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label>Interviewers</Label>
            <Input
              value={formData.interviewer_names?.join(', ') || ''}
              onChange={(e) => setFormData({ ...formData, interviewer_names: e.target.value.split(',').map(s => s.trim()) })}
              placeholder="John Doe, Jane Smith"
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label>Feedback Summary</Label>
            <Textarea
              value={formData.feedback_summary || ''}
              onChange={(e) => setFormData({ ...formData, feedback_summary: e.target.value })}
              placeholder="Overall impressions and feedback..."
              disabled={!isEditing}
              rows={4}
            />
          </div>

          <div>
            <Label>Next Steps</Label>
            <Textarea
              value={formData.next_steps || ''}
              onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
              placeholder="What needs to happen next..."
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div>
            <Label>Next Step Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.next_step_date && "text-muted-foreground"
                  )}
                  disabled={!isEditing}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.next_step_date ? (
                    format(new Date(formData.next_step_date), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.next_step_date ? new Date(formData.next_step_date) : undefined}
                  onSelect={(date) => setFormData({ ...formData, next_step_date: date?.toISOString() ?? null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Round Form Component
function AddRoundForm({
  jobId,
  nextRoundNumber,
  onSuccess
}: {
  jobId: string;
  nextRoundNumber: number;
  onSuccess: () => void;
}) {
  const { createRound, isCreating } = useCreateInterviewRound(jobId);
  const [formData, setFormData] = useState({
    round_number: nextRoundNumber,
    stage: 'phone_screen' as InterviewStage,
    status: 'scheduled' as InterviewRoundStatus,
    interview_format: 'video' as InterviewFormat,
    scheduled_date: addDays(new Date(), 7).toISOString(),
    duration_minutes: 60
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRound(formData);
      onSuccess();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Round Number</Label>
          <Input
            type="number"
            value={formData.round_number}
            onChange={(e) => setFormData({ ...formData, round_number: parseInt(e.target.value) })}
            min={1}
            max={8}
            required
          />
        </div>
        <div>
          <Label>Stage</Label>
          <Select
            value={formData.stage}
            onValueChange={(value) => setFormData({ ...formData, stage: value as InterviewStage })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone_screen">Phone Screen</SelectItem>
              <SelectItem value="technical_1">Technical Round 1</SelectItem>
              <SelectItem value="technical_2">Technical Round 2</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="system_design">System Design</SelectItem>
              <SelectItem value="final">Final Round</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Scheduled Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.scheduled_date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.scheduled_date ? (
                format(new Date(formData.scheduled_date), 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={new Date(formData.scheduled_date)}
              onSelect={(date) => setFormData({ ...formData, scheduled_date: date?.toISOString() || '' })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Format</Label>
          <Select
            value={formData.interview_format}
            onValueChange={(value) => setFormData({ ...formData, interview_format: value as InterviewFormat })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video Call</SelectItem>
              <SelectItem value="phone">Phone Call</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="take_home">Take Home</SelectItem>
              <SelectItem value="panel">Panel</SelectItem>
              <SelectItem value="casual">Casual Chat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
            min={15}
            max={480}
            step={15}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Round"}
      </Button>
    </form>
  );
}