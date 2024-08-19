import { useRouteRef } from '@backstage/core-plugin-api';
import { Typography, Box } from '@material-ui/core';
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineOppositeContent,
  TimelineConnector,
  TimelineDot,
  TimelineSeparator,
} from '@material-ui/lab';
import React from 'react';
import { Link } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import { DateTime } from 'luxon';
import { announcementViewRouteRef } from '../../routes';
import { useAnnouncements } from '@procore-oss/backstage-plugin-announcements-react';
import { Progress } from '@backstage/core-components';

/**
 * Props for the AnnouncementsTimeline component.
 */
export type AnnouncementsTimelineProps = {
  /**
   * The maximum number of results to display.
   * Default: 10
   */
  maxResults?: number;
  /**
   * The alignment of the timeline items. Can be 'left', 'right', or 'alternate'.
   * Default: 'alternate'
   */
  timelineAlignment?: 'left' | 'right' | 'alternate';
  /**
   * The minimum width of the timeline.
   * Default: '425px'
   */
  timelineMinWidth?: string;
};

/**
 * Default alignment for the timeline.
 */
const DEFAULT_TIMELINE_ALIGNMENT = 'alternate';

/**
 * Default width for the timeline.
 */
const DEFAULT_TIMELINE_WIDTH = '425px';

/**
 * Default maximum number of results to display.
 */
const DEFAULT_RESULTS_MAX = 10;

/**
 * Timeline of most recent announcements.
 *
 * @param options - The options for the announcements timeline.
 * @returns The rendered announcements timeline.
 */
export const AnnouncementsTimeline = ({
  maxResults = DEFAULT_RESULTS_MAX,
  timelineAlignment = DEFAULT_TIMELINE_ALIGNMENT,
  timelineMinWidth = DEFAULT_TIMELINE_WIDTH,
}: AnnouncementsTimelineProps) => {
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);

  const { announcements, loading, error } = useAnnouncements({
    max: maxResults,
  });

  if (loading) {
    return <Progress />;
  }

  if (!announcements || announcements.count === 0) return <>No announcements</>;

  if (error) return <>Error: {error.message}</>;

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={0}
    >
      <Box sx={{ minWidth: timelineMinWidth }}>
        <Timeline align={timelineAlignment}>
          {announcements.results.map(a => (
            <TimelineItem key={`ti-${a.id}`}>
              <TimelineOppositeContent
                key={`toc-${a.id}`}
                style={{ margin: 'auto 0' }}
              >
                {DateTime.fromISO(a.created_at).toRelative()}
              </TimelineOppositeContent>

              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color="primary" />
                <TimelineConnector />
              </TimelineSeparator>

              <TimelineContent key={`tc-${a.id}`}>
                <Link to={viewAnnouncementLink({ id: a.id })}>
                  <Typography key={`th6-${a.id}`} variant="h6" component="span">
                    {a.title}
                  </Typography>
                </Link>
                <Typography key={`te-${a.id}`} variant="body2">
                  {a.excerpt}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Stack>
  );
};
