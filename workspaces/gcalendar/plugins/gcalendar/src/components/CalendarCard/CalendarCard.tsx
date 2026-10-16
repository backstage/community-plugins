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
import { DateTime } from 'luxon';
import { useState } from 'react';

import { InfoCard, Progress } from '@backstage/core-components';
import { useAnalytics } from '@backstage/core-plugin-api';

import { Box, ButtonIcon, Flex, Text } from '@backstage/ui';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

import {
  useCalendarsQuery,
  useEventsQuery,
  useSignIn,
  useStoredCalendars,
} from '../../hooks';
import calendarCardIcon from '../../icons/calendarIcon.svg';
import { CalendarEvent } from './CalendarEvent';
import { CalendarSelect } from './CalendarSelect';
import { SignInContent } from './SignInContent';
import { getStartDate } from './util';
import useAsync from 'react-use/esm/useAsync';
import styles from './CalendarCard.module.css';

export const CalendarCard = () => {
  const [date, setDate] = useState(DateTime.now());
  const analytics = useAnalytics();

  const changeDay = (offset = 1) => {
    setDate(prev => prev.plus({ day: offset }));
    analytics.captureEvent('click', 'change date');
  };

  const { isSignedIn, isInitialized, signIn } = useSignIn();

  useAsync(async () => signIn(true), [signIn]);

  const {
    isLoading: isCalendarLoading,
    isFetching: isCalendarFetching,
    data: calendars = [],
  } = useCalendarsQuery({
    enabled: isSignedIn,
  });
  const primaryCalendarId = calendars.find(c => c.primary === true)?.id;
  const defaultSelectedCalendars = primaryCalendarId ? [primaryCalendarId] : [];
  const [storedCalendars, setStoredCalendars] = useStoredCalendars(
    defaultSelectedCalendars,
  );

  const { events, isLoading: isEventLoading } = useEventsQuery({
    calendars,
    selectedCalendars: storedCalendars,
    enabled: isSignedIn && calendars.length > 0,
    timeMin: date.startOf('day').toISO()!,
    timeMax: date.endOf('day').toISO()!,
    timeZone: date.zoneName ?? 'UTC', // TODO: Use browser timezone? This probably never happens anyway
  });

  const showLoader =
    (isCalendarLoading && isCalendarFetching) ||
    isEventLoading ||
    !isInitialized;

  return (
    <InfoCard
      noPadding
      title={
        <Flex align="center" gap="2">
          <Box className={styles.calendarIcon}>
            <img src={calendarCardIcon} alt="Google Calendar" />
          </Box>
          {isSignedIn ? (
            <>
              <ButtonIcon
                aria-label="Previous day"
                variant="tertiary"
                size="small"
                onPress={() => changeDay(-1)}
                icon={<RiArrowLeftSLine />}
              />
              <ButtonIcon
                aria-label="Next day"
                variant="tertiary"
                size="small"
                onPress={() => changeDay(1)}
                icon={<RiArrowRightSLine />}
              />
              <Text variant="title-small">
                {date.toLocaleString({
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>

              <div className={styles.spacer} />

              <CalendarSelect
                calendars={calendars}
                selectedCalendars={storedCalendars}
                setSelectedCalendars={setStoredCalendars}
                disabled={
                  (isCalendarFetching && isCalendarLoading) || !isSignedIn
                }
              />
            </>
          ) : (
            <Text variant="title-small">Agenda</Text>
          )}
        </Flex>
      }
      deepLink={{
        link: 'https://calendar.google.com/',
        title: 'Go to Calendar',
      }}
    >
      <Box>
        {showLoader && (
          <div className={styles.loaderWrap}>
            <Progress variant="query" />
          </div>
        )}
        {!isSignedIn && isInitialized && (
          <SignInContent handleAuthClick={() => signIn(false)} />
        )}
        {!isEventLoading && !isCalendarLoading && isSignedIn && (
          <Box className={styles.eventList}>
            {events.length === 0 && (
              <div className={styles.noEventsWrap}>
                <Text as="h6" variant="title-small" className={styles.noEvents}>
                  No events
                </Text>
              </div>
            )}
            {sortBy(events, [getStartDate]).map(event => (
              <CalendarEvent
                key={`${event.calendarId}-${event.id}`}
                event={event}
              />
            ))}
          </Box>
        )}
      </Box>
    </InfoCard>
  );
};
