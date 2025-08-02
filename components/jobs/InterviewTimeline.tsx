'use client';

import React, { useMemo } from 'react';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TimelineMarkers,
  TodayMarker,
  CustomMarker
} from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import { InterviewRound, InterviewRoundStatus, getStageLabel, getStatusColor } from '@/types/interview';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InterviewTimelineProps {
  interviews: Array<{
    interview: InterviewRound;
    job: {
      id: string;
      title: string;
      company: string;
    };
  }>;
  onInterviewClick?: (interview: InterviewRound, jobId: string) => void;
  view?: 'week' | 'month' | 'quarter';
  height?: number;
}

export function InterviewTimeline({
  interviews,
  onInterviewClick,
  view = 'month',
  height = 400
}: InterviewTimelineProps) {
  // Transform data for react-calendar-timeline
  const { groups, items } = useMemo(() => {
    // Create groups from unique companies
    const companyMap = new Map<string, { id: string; title: string }>();
    interviews.forEach(({ job }) => {
      if (!companyMap.has(job.company)) {
        companyMap.set(job.company, {
          id: job.company,
          title: job.company
        });
      }
    });

    const groups = Array.from(companyMap.values());

    // Create timeline items
    const items = interviews
      .filter(({ interview }) => interview.scheduled_date)
      .map(({ interview, job }) => {
        const startTime = moment(interview.scheduled_date);
        const duration = interview.duration_minutes || 60;
        const endTime = moment(startTime).add(duration, 'minutes');

        return {
          id: interview.id,
          group: job.company,
          title: `${getStageLabel(interview.stage)} - ${job.title}`,
          start_time: startTime.valueOf(),
          end_time: endTime.valueOf(),
          canMove: false,
          canResize: false,
          itemProps: {
            className: cn(
              'rounded-md border-2',
              interview.status === 'completed' && 'opacity-75',
              interview.status === 'cancelled' && 'line-through opacity-50'
            ),
            style: {
              backgroundColor: `var(--${getStatusColor(interview.status as InterviewRoundStatus)}-100)`,
              borderColor: `var(--${getStatusColor(interview.status as InterviewRoundStatus)}-500)`,
              color: `var(--${getStatusColor(interview.status as InterviewRoundStatus)}-900)`
            },
            onDoubleClick: () => onInterviewClick?.(interview, job.id)
          }
        };
      });

    return { groups, items };
  }, [interviews, onInterviewClick]);

  // Calculate visible time range based on view
  const { defaultTimeStart, defaultTimeEnd } = useMemo(() => {
    const now = moment();
    let start, end;

    switch (view) {
      case 'week':
        start = moment(now).startOf('week');
        end = moment(now).endOf('week').add(1, 'week');
        break;
      case 'quarter':
        start = moment(now).startOf('month').subtract(1, 'month');
        end = moment(now).endOf('month').add(2, 'months');
        break;
      case 'month':
      default:
        start = moment(now).startOf('month');
        end = moment(now).endOf('month');
        break;
    }

    return {
      defaultTimeStart: start.valueOf(),
      defaultTimeEnd: end.valueOf()
    };
  }, [view]);

  // Custom item renderer
  const itemRenderer = ({
    item,
    itemContext,
    getItemProps,
    getResizeProps
  }: any) => {
    const interview = interviews.find(i => i.interview.id === item.id);
    if (!interview) return null;

    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    
    return (
      <div {...getItemProps(item.itemProps)}>
        <div
          className="flex items-center justify-between px-2 h-full"
          style={{ maxHeight: `${itemContext.dimensions.height}px` }}
        >
          <div className="flex-1 truncate text-xs font-medium">
            {itemContext.title}
          </div>
          {interview.interview.outcome && (
            <Badge 
              variant="outline" 
              className="ml-1 text-[10px] px-1 py-0"
              style={{
                borderColor: `var(--${getStatusColor(interview.interview.status as InterviewRoundStatus)}-500)`,
                color: `var(--${getStatusColor(interview.interview.status as InterviewRoundStatus)}-700)`
              }}
            >
              {interview.interview.outcome}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  if (groups.length === 0 || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">No interviews scheduled</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        canMove={false}
        canResize={false}
        canChangeGroup={false}
        lineHeight={50}
        itemHeightRatio={0.75}
        itemRenderer={itemRenderer}
        minZoom={60 * 60 * 1000 * 24} // 1 day
        maxZoom={60 * 60 * 1000 * 24 * 90} // 90 days
        sidebarWidth={150}
        buffer={3}
      >
        <TimelineHeaders className="sticky top-0 z-10">
          <SidebarHeader>
            {({ getRootProps }) => (
              <div {...getRootProps()}>
                <div className="px-4 py-2 font-semibold text-sm">
                  Company
                </div>
              </div>
            )}
          </SidebarHeader>
          <DateHeader unit="primaryHeader" />
          <DateHeader />
        </TimelineHeaders>
        <TimelineMarkers>
          <TodayMarker />
          {/* Add markers for important dates */}
          {items.map(item => {
            const interview = interviews.find(i => i.interview.id === item.id);
            if (interview?.interview.next_step_date) {
              return (
                <CustomMarker
                  key={`next-${item.id}`}
                  date={new Date(interview.interview.next_step_date).getTime()}
                >
                  {({ styles }) => (
                    <div
                      style={{
                        ...styles,
                        backgroundColor: 'var(--yellow-500)',
                        width: '2px'
                      }}
                      title="Next step deadline"
                    />
                  )}
                </CustomMarker>
              );
            }
            return null;
          })}
        </TimelineMarkers>
      </Timeline>
    </div>
  );
}