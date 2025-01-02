/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useRouteRef } from '@backstage/core-plugin-api';
import React from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import { announcementViewRouteRef } from '../../routes';
import {
  useAnnouncements,
  useAnnouncementsTranslation,
} from '@backstage-community/plugin-announcements-react';
import { Progress } from '@backstage/core-components';
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineDot,
  TimelineSeparator,
  TimelineOppositeContent,
  TimelineContent,
} from '@material-ui/lab';
import { Box, Typography } from '@material-ui/core';
import Stack from '@mui/material/Stack';

/**
 * Props for the AnnouncementsTimeline component.
 *
 * @public
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
  /**
   * Whether to only show active announcements.
   * Default: false
   */
  hideInactive?: boolean;
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
 * Default setting for only displaying active annoucenments.
 */
const DEFAULT_INACTIVE = false;

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
  hideInactive = DEFAULT_INACTIVE,
}: AnnouncementsTimelineProps) => {
  const viewAnnouncementLink = useRouteRef(announcementViewRouteRef);

  const { announcements, loading, error } = useAnnouncements({
    max: maxResults,
    active: hideInactive,
  });
  const { t } = useAnnouncementsTranslation();

  if (loading) {
    return <Progress />;
  }

  if (!announcements || announcements.count === 0)
    return <>{t('announcementsTimeline.noAnnouncements')}</>;

  if (error)
    return <>{`${t('announcementsTimeline.error')}: ${error.message}`}</>;

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
