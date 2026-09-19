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
import { ButtonIcon, Text } from '@backstage/ui';
import { RiArrowRightSLine } from '@remixicon/react';

import { AttendeeChip } from './AttendeeChip';
import { MicrosoftCalendarEvent } from '../api';
import { getTimePeriod, getOnlineMeetingLink } from './util';
import styles from './CalendarEventPopoverContent.module.css';

type CalendarEventPopoverProps = {
  event: MicrosoftCalendarEvent;
};

export const CalendarEventPopoverContent = ({
  event,
}: CalendarEventPopoverProps) => {
  const onlineMeetingLink = getOnlineMeetingLink(event);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Text variant="title-small">{event.subject}</Text>
          <Text variant="body-small" color="secondary">
            {getTimePeriod(event)}
          </Text>
        </div>
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
      </div>
      {onlineMeetingLink && (
        <Link to={onlineMeetingLink} onClick={_e => {}} noTrack>
          Join Online Meeting
        </Link>
      )}

      {event.bodyPreview && (
        <>
          <div className={styles.divider} />
          <div
            className={styles.description}
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
          <div className={styles.divider} />
          <div>
            <Text variant="body-small" color="secondary">
              Attendees
            </Text>
            <div className={styles.attendeeGap} />
            {sortBy(event.attendees || [], 'emailAddress').map(user => (
              <AttendeeChip
                key={user.emailAddress?.address || ''}
                user={user}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
