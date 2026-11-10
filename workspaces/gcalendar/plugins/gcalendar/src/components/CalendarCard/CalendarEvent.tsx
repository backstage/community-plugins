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

import { useAnalytics } from '@backstage/core-plugin-api';
import { Link } from '@backstage/core-components';

import {
  Box,
  Card,
  DialogTrigger,
  Flex,
  Popover,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';

import zoomIcon from '../../icons/zoomIcon.svg';
import { CalendarEventPopoverContent } from './CalendarEventPopoverContent';
import { GCalendarEvent, ResponseStatus } from '../../api';
import { getTimePeriod, getZoomLink, isAllDay, isPassed } from './util';
import styles from './CalendarEvent.module.css';

export const CalendarEvent = ({ event }: { event: GCalendarEvent }) => {
  const analytics = useAnalytics();
  const zoomLink = getZoomLink(event);

  return (
    <DialogTrigger>
      <Card
        data-testid="calendar-event"
        label={event.summary ?? 'Calendar event'}
        onPress={() => analytics.captureEvent('click', 'event info')}
        className={classnames(styles.event, {
          [styles.passed]: isPassed(event),
        })}
      >
        <Flex align="center" gap="2">
          <Box
            className={classnames(styles.calendarColor, {
              [styles.calendarColorPrimary]: event.primary,
            })}
            style={
              event.primary
                ? undefined
                : { backgroundColor: event.backgroundColor }
            }
          >
            {null}
          </Box>
          <Box className={styles.content}>
            <Text
              as="p"
              variant="body-medium"
              className={classnames({
                [styles.declined]:
                  event.responseStatus === ResponseStatus.declined,
              })}
            >
              {event.summary}
            </Text>
            {!isAllDay(event) && (
              <Text
                as="p"
                variant="body-small"
                data-testid="calendar-event-time"
              >
                {getTimePeriod(event)}
              </Text>
            )}
          </Box>

          {zoomLink && (
            <TooltipTrigger>
              <Link
                data-testid="calendar-event-zoom-link"
                className={styles.zoomLink}
                to={zoomLink}
                onClick={e => {
                  e.stopPropagation();
                  analytics.captureEvent('click', 'zoom link');
                }}
                noTrack
              >
                <img src={zoomIcon} alt="Zoom link" />
              </Link>
              <Tooltip>Join Zoom Meeting</Tooltip>
            </TooltipTrigger>
          )}
        </Flex>
      </Card>

      <Popover data-testid="calendar-event-popover">
        <CalendarEventPopoverContent event={event} />
      </Popover>
    </DialogTrigger>
  );
};
