/*
 * Copyright 2022 The Backstage Authors
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
import { sortBy } from 'lodash';
import DOMPurify from 'dompurify';

import { useAnalytics } from '@backstage/core-plugin-api';
import { Link } from '@backstage/core-components';
import { Box, ButtonIcon, Flex, Text, Tooltip } from '@backstage/ui';
import { TooltipTrigger } from 'react-aria-components';
import { RiArrowRightLine } from '@remixicon/react';

import { AttendeeChip } from './AttendeeChip';
import { GCalendarEvent } from '../../api';
import { getTimePeriod, getZoomLink } from './util';
import styles from './CalendarEventPopoverContent.module.css';

type CalendarEventPopoverProps = {
  event: GCalendarEvent;
};

export const CalendarEventPopoverContent = ({
  event,
}: CalendarEventPopoverProps) => {
  const analytics = useAnalytics();
  const zoomLink = getZoomLink(event);

  return (
    <Flex direction="column" className={styles.root} p="4">
      <Flex align="center" gap="2">
        <Box className={styles.title}>
          <Text as="h6" variant="title-small">
            {event.summary}
          </Text>
          <Text as="p" variant="body-small">
            {getTimePeriod(event)}
          </Text>
        </Box>
        {event.htmlLink && (
          <TooltipTrigger>
            <Link
              data-testid="open-calendar-link"
              to={event.htmlLink}
              onClick={_e =>
                analytics.captureEvent('click', 'open in calendar')
              }
              noTrack
            >
              <ButtonIcon
                aria-label="Open in Calendar"
                variant="tertiary"
                icon={<RiArrowRightLine />}
              />
            </Link>
            <Tooltip>Open in Calendar</Tooltip>
          </TooltipTrigger>
        )}
      </Flex>
      {zoomLink && (
        <Link
          to={zoomLink}
          onClick={_e => analytics.captureEvent('click', 'zoom link')}
          noTrack
        >
          Join Zoom Meeting
        </Link>
      )}

      {event.description && (
        <>
          <hr className={styles.divider} />
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(event.description, {
                USE_PROFILES: { html: true },
              }),
            }}
          />
        </>
      )}

      {event.attendees && (
        <>
          <hr className={styles.divider} />
          <Box>
            <Text as="p" variant="body-small">
              Attendees
            </Text>
            <div className={styles.attendees}>
              {sortBy(event.attendees || [], 'email').map(user => (
                <AttendeeChip key={user.email} user={user} />
              ))}
            </div>
          </Box>
        </>
      )}
    </Flex>
  );
};
