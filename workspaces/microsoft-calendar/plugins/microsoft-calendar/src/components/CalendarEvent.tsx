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
import classnames from 'classnames';
import { useRef, useState } from 'react';
import { TooltipTrigger, Tooltip } from 'react-aria-components';

import { Link } from '@backstage/core-components';
import { Text } from '@backstage/ui';

import webcamIcon from '../icons/webcam.svg';
import { CalendarEventPopoverContent } from './CalendarEventPopoverContent';
import { MicrosoftCalendarEvent } from '../api';
import {
  getOnlineMeetingLink,
  getTimePeriod,
  isAllDay,
  isPassed,
} from './util';
import styles from './CalendarEvent.module.css';

export const CalendarEvent = ({ event }: { event: MicrosoftCalendarEvent }) => {
  const [hovered, setHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onlineMeetingLink = getOnlineMeetingLink(event);

  return (
    <div ref={containerRef} className={styles.eventWrapper}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div
        onClick={() => setPopoverOpen(!popoverOpen)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={classnames(styles.event, {
          [styles.passed]: isPassed(event),
          [styles.hovered]: hovered,
        })}
        data-testid="microsoft-calendar-event"
      >
        <div className={styles.calendarColor} />
        <div className={styles.content}>
          <Text
            variant="body-small"
            className={classnames({ [styles.declined]: event.isCancelled })}
          >
            {event.subject}
          </Text>
          {!isAllDay(event) && (
            <Text
              variant="body-x-small"
              color="secondary"
              data-testid="calendar-event-time"
            >
              {getTimePeriod(event)}
            </Text>
          )}
        </div>

        {event.isOnlineMeeting && (
          <TooltipTrigger>
            <Link
              data-testid="calendar-event-online-meeting-link"
              className={styles.link}
              to={onlineMeetingLink}
              onClick={e => {
                e.stopPropagation();
              }}
              noTrack
            >
              <img
                height={32}
                width={32}
                src={webcamIcon}
                alt="Online Meeting link"
              />
            </Link>
            <Tooltip>Join Online Meeting</Tooltip>
          </TooltipTrigger>
        )}
      </div>

      {popoverOpen && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div className={styles.popover} onClick={e => e.stopPropagation()}>
          <CalendarEventPopoverContent event={event} />
        </div>
      )}
      {popoverOpen && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
          className={styles.popoverBackdrop}
          onClick={() => setPopoverOpen(false)}
        />
      )}
    </div>
  );
};
