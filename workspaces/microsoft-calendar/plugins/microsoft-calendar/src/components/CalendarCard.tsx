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
import { ButtonIcon, Text, Box, Flex } from '@backstage/ui';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

import { useCalendarsQuery, useEventsQuery, useSignIn } from '../hooks';
import calendarIcon from '../icons/calendar.svg';
import { CalendarEvent } from './CalendarEvent';
import { CalendarSelect } from './CalendarSelect';
import { SignInContent } from './SignInContent';
import { getStartDate } from './util';
import useAsync from 'react-use/esm/useAsync';

export const CalendarCard = () => {
  const [date, setDate] = useState(DateTime.now());
  const [selectedCalendarId, setSelectedCalendarId] = useState('');

  const changeDay = (offset = 1) => {
    setDate(prev => prev.plus({ day: offset }));
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

  const defaultCalendarId = calendars.find(c => c.isDefaultCalendar)?.id;

  const { data: events, isLoading: isEventLoading } = useEventsQuery({
    calendarId: selectedCalendarId || defaultCalendarId || '',
    enabled: isSignedIn && calendars.length > 0,
    timeMin: date.startOf('day').toISO()!,
    timeMax: date.endOf('day').toISO()!,
    timeZone: date.zoneName ?? undefined,
  });

  const showLoader =
    (isCalendarLoading && isCalendarFetching) ||
    isEventLoading ||
    !isInitialized;

  return (
    <InfoCard
      noPadding
      title={
        <Flex gap="2" align="center">
          <Flex
            style={{ width: '32px', height: '32px' }}
            align="center"
            justify="center"
          >
            <img
              src={calendarIcon}
              alt="Microsoft Calendar"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Flex>
          {isSignedIn ? (
            <>
              <ButtonIcon
                onClick={() => changeDay(-1)}
                icon={<RiArrowLeftSLine size={16} />}
                variant="secondary"
                aria-label="Previous day"
              />
              <ButtonIcon
                onClick={() => changeDay(1)}
                icon={<RiArrowRightSLine size={16} />}
                variant="secondary"
                aria-label="Next day"
              />
              <div style={{ flex: 1 }} />
              <Text variant="body-medium">
                {date.toLocaleString({
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>

              <CalendarSelect
                calendars={calendars}
                selectedCalendarId={selectedCalendarId || defaultCalendarId}
                setSelectedCalendarId={setSelectedCalendarId}
                disabled={
                  (isCalendarFetching && isCalendarLoading) || !isSignedIn
                }
              />
            </>
          ) : (
            <Text variant="body-medium">Agenda</Text>
          )}
        </Flex>
      }
      deepLink={{
        link: 'https://outlook.office.com/calendar/',
        title: 'Go to Calendar',
      }}
    >
      <Box>
        {showLoader && (
          <Box p="3">
            <Progress variant="query" />
          </Box>
        )}
        {!isSignedIn && isInitialized && (
          <SignInContent handleAuthClick={() => signIn(false)} />
        )}
        {!isEventLoading && !isCalendarLoading && isSignedIn && (
          <Box p="1" pb="0" style={{ maxHeight: '602px', overflowY: 'auto' }}>
            {events?.length === 0 && (
              <Box pt="3" pb="3" style={{ textAlign: 'center' }}>
                <Text color="secondary">No events</Text>
              </Box>
            )}
            {sortBy(events, [getStartDate]).map(event => (
              <CalendarEvent key={`${event.id}`} event={event} />
            ))}
          </Box>
        )}
      </Box>
    </InfoCard>
  );
};
