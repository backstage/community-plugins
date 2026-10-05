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
import { useRef, useState } from 'react';
import { TooltipTrigger, Tooltip } from 'react-aria-components';

import { Link } from '@backstage/core-components';
import { Text, Box, Flex } from '@backstage/ui';

import webcamIcon from '../icons/webcam.svg';
import { CalendarEventPopoverContent } from './CalendarEventPopoverContent';
import { MicrosoftCalendarEvent } from '../api';
import {
  getOnlineMeetingLink,
  getTimePeriod,
  isAllDay,
  isPassed,
} from './util';

export const CalendarEvent = ({ event }: { event: MicrosoftCalendarEvent }) => {
  const [hovered, setHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onlineMeetingLink = getOnlineMeetingLink(event);

  const eventStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 'var(--bui-space-2)',
    cursor: 'pointer',
    paddingRight: '12px',
    padding: 'var(--bui-space-2)',
    borderRadius: 'var(--bui-radius-1)',
    backgroundColor: 'var(--bui-bg-surface-1)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    transition: 'box-shadow 150ms ease-in-out',
    opacity: isPassed(event) ? 0.6 : 1,
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div
        onClick={() => setPopoverOpen(!popoverOpen)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          ...eventStyle,
          boxShadow: hovered
            ? '0 4px 12px rgba(0, 0, 0, 0.12)'
            : '0 1px 3px rgba(0, 0, 0, 0.08)',
        }}
        data-testid="microsoft-calendar-event"
      >
        <div
          style={{
            width: '8px',
            height: '100%',
            borderTopLeftRadius: '4px',
            borderBottomLeftRadius: '4px',
            backgroundColor: 'var(--bui-fg-primary)',
            marginRight: 'var(--bui-space-2)',
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            paddingTop: 'var(--bui-space-1)',
            paddingBottom: 'var(--bui-space-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--bui-space-1)',
          }}
        >
          <Text
            variant="body-small"
            style={{
              textDecoration: event.isCancelled ? 'line-through' : 'none',
            }}
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
              style={{
                width: '48px',
                height: '48px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                flexShrink: 0,
                transition: 'background-color 150ms ease-in-out',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'var(--bui-bg-surface-2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  'transparent';
              }}
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
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Link>
            <Tooltip>Join Online Meeting</Tooltip>
          </TooltipTrigger>
        )}
      </div>

      {popoverOpen && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <Box
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: 1000,
            backgroundColor: 'var(--bui-bg-surface-1)',
            border: '1px solid var(--bui-border-neutral)',
            borderRadius: 'var(--bui-radius-2)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            marginTop: 'var(--bui-space-2)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <CalendarEventPopoverContent event={event} />
        </Box>
      )}
      {popoverOpen && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: 999,
          }}
          onClick={() => setPopoverOpen(false)}
        />
      )}
    </div>
  );
};
