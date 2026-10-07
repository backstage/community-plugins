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
import { TooltipTrigger, Tooltip } from 'react-aria-components';

import { Link } from '@backstage/core-components';
import { ButtonIcon, Text, Flex, Box } from '@backstage/ui';
import { RiArrowRightSLine } from '@remixicon/react';

import { AttendeeChip } from './AttendeeChip';
import { MicrosoftCalendarEvent } from '../api';
import { getTimePeriod, getOnlineMeetingLink } from './util';

type CalendarEventPopoverProps = {
  event: MicrosoftCalendarEvent;
};

export const CalendarEventPopoverContent = ({
  event,
}: CalendarEventPopoverProps) => {
  const onlineMeetingLink = getOnlineMeetingLink(event);

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '400px',
        padding: 'var(--bui-space-3)',
        gap: 'var(--bui-space-2)',
      }}
    >
      <Flex gap="2" align="start" justify="between">
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--bui-space-1)',
            flex: 1,
          }}
        >
          <Text variant="title-small">{event.subject}</Text>
          <Text variant="body-small" color="secondary">
            {getTimePeriod(event)}
          </Text>
        </Box>
        {event.webLink && (
          <TooltipTrigger>
            <Link
              data-testid="open-calendar-link"
              to={event.webLink}
              onClick={_e => {}}
              noTrack
            >
              <ButtonIcon
                icon={<RiArrowRightSLine size={16} />}
                variant="secondary"
                aria-label="Open in Calendar"
              />
            </Link>
            <Tooltip>Open in Calendar</Tooltip>
          </TooltipTrigger>
        )}
      </Flex>
      {onlineMeetingLink && (
        <Link to={onlineMeetingLink} onClick={_e => {}} noTrack>
          Join Online Meeting
        </Link>
      )}

      {event.bodyPreview && (
        <>
          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--bui-border-neutral)',
              margin: 'var(--bui-space-3) 0',
            }}
          />
          <div
            style={{
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                (event.body && event.body.content) || '',
                {
                  USE_PROFILES: { html: true },
                },
              ),
            }}
          />
        </>
      )}

      {event.attendees && (
        <>
          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--bui-border-neutral)',
              margin: 'var(--bui-space-3) 0',
            }}
          />
          <Box>
            <Text variant="body-small" color="secondary">
              Attendees
            </Text>
            <div style={{ height: 'var(--bui-space-2)' }} />
            {sortBy(event.attendees || [], 'emailAddress').map(user => (
              <AttendeeChip
                key={user.emailAddress?.address || ''}
                user={user}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};
