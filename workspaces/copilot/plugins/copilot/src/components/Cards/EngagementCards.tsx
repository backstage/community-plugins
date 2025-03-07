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
import React, { PropsWithChildren } from 'react';
import FunctionsIcon from '@mui/icons-material/Functions';
import TimelineIcon from '@mui/icons-material/Timeline';
import Box from '@mui/material/Box';
import { Card } from './Card';
import { EngagementCardsProps } from '../../types';
import { styled } from '@mui/material/styles';

const CardBox = styled(Box)({
  flex: '1 1 calc(20% - 10px)',
  minWidth: 200,
  maxWidth: 'calc(50% - 10px)',
  boxSizing: 'border-box',
});

export const EngagementCards = ({
  team,
  metrics,
  metricsByTeam,
  seats,
  seatsByTeam,
  startDate,
  endDate,
}: PropsWithChildren<EngagementCardsProps>) => {
  let primaryValue = 0;
  if ((team && seatsByTeam.length > 0) || seats.length > 0) {
    primaryValue = team ? seatsByTeam[0].total_seats : seats[0].total_seats;
  }

  let secondaryValue: number | undefined = 0;
  if (seats.length > 0) {
    secondaryValue = team ? seats[0].total_seats : undefined;
  }

  let primaryUnusedSeatValue = 0;
  if ((team && seatsByTeam.length > 0) || seats.length > 0) {
    primaryUnusedSeatValue = team
      ? seatsByTeam[0].seats_never_used
      : seats[0].seats_never_used;
  }

  let secondaryUnusedSeatValue: number | undefined = 0;
  if (seats.length > 0) {
    secondaryUnusedSeatValue = team ? seats[0].seats_never_used : undefined;
  }

  // Seats inactive for 7 days
  let primaryInactive7DaysValue = 0;
  if ((team && seatsByTeam.length > 0) || seats.length > 0) {
    primaryInactive7DaysValue = team
      ? seatsByTeam[0].seats_inactive_7_days
      : seats[0].seats_inactive_7_days;
  }

  let secondaryInactive7DaysValue: number | undefined = 0;
  if (seats.length > 0) {
    secondaryInactive7DaysValue = team
      ? seats[0].seats_inactive_7_days
      : undefined;
  }

  // Seats inactive for 14 days
  let primaryInactive14DaysValue = 0;
  if ((team && seatsByTeam.length > 0) || seats.length > 0) {
    primaryInactive14DaysValue = team
      ? seatsByTeam[0].seats_inactive_14_days
      : seats[0].seats_inactive_14_days;
  }

  let secondaryInactive14DaysValue: number | undefined = 0;
  if (seats.length > 0) {
    secondaryInactive14DaysValue = team
      ? seats[0].seats_inactive_14_days
      : undefined;
  }

  // Seats inactive for 28 days
  let primaryInactive28DaysValue = 0;
  if ((team && seatsByTeam.length > 0) || seats.length > 0) {
    primaryInactive28DaysValue = team
      ? seatsByTeam[0].seats_inactive_28_days
      : seats[0].seats_inactive_28_days;
  }

  let secondaryInactive28DaysValue: number | undefined = 0;
  if (seats.length > 0) {
    secondaryInactive28DaysValue = team
      ? seats[0].seats_inactive_28_days
      : undefined;
  }

  // Calculate average metrics from the data, excluding weekend data, and round to nearest integer
  const calculateAverage = (dataSource: any[], property: string): number => {
    if (!dataSource || dataSource.length === 0) return 0;

    // Filter out weekends (Saturday=6, Sunday=0)
    const weekdayData = dataSource.filter(item => {
      if (!item.day) return true; // Keep items without date
      const date = new Date(item.day);
      const dayOfWeek = date.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Sunday (0) and Saturday (6)
    });

    if (weekdayData.length === 0) return 0;

    const validValues = weekdayData
      .map(item => Number(item[property]))
      .filter(val => !isNaN(val));

    if (validValues.length === 0) return 0;
    return Math.round(
      validValues.reduce((sum, val) => sum + val, 0) / validValues.length,
    );
  };

  // Calculate metrics according to the correct pattern:
  // - primaryValue: from metricsByTeam if team=true, otherwise from metrics
  // - secondaryValue: from metrics if team=true, otherwise undefined

  // dotcom_chats_engaged_users
  const avgDotcomChatsUsers = team
    ? calculateAverage(metricsByTeam, 'dotcom_chats_engaged_users')
    : calculateAverage(metrics, 'dotcom_chats_engaged_users');
  const secondaryDotcomChatsUsers = team
    ? calculateAverage(metrics, 'dotcom_chats_engaged_users')
    : undefined;

  // dotcom_prs_engaged_users
  const avgDotcomPrsUsers = team
    ? calculateAverage(metricsByTeam, 'dotcom_prs_engaged_users')
    : calculateAverage(metrics, 'dotcom_prs_engaged_users');
  const secondaryDotcomPrsUsers = team
    ? calculateAverage(metrics, 'dotcom_prs_engaged_users')
    : undefined;

  // ide_chat_engaged_users
  const avgIdeChatUsers = team
    ? calculateAverage(metricsByTeam, 'ide_chats_engaged_users')
    : calculateAverage(metrics, 'ide_chats_engaged_users');
  const secondaryIdeChatUsers = team
    ? calculateAverage(metrics, 'ide_chats_engaged_users')
    : undefined;

  // ide_completions_engaged_users
  const avgIdeCompletionsUsers = team
    ? calculateAverage(metricsByTeam, 'ide_completions_engaged_users')
    : calculateAverage(metrics, 'ide_completions_engaged_users');
  const secondaryIdeCompletionsUsers = team
    ? calculateAverage(metrics, 'ide_completions_engaged_users')
    : undefined;

  // total_active_users
  const avgTotalActiveUsers = team
    ? calculateAverage(metricsByTeam, 'total_active_users')
    : calculateAverage(metrics, 'total_active_users');
  const secondaryTotalActiveUsers = team
    ? calculateAverage(metrics, 'total_active_users')
    : undefined;

  // total_engaged_users
  const avgTotalEngagedUsers = team
    ? calculateAverage(metricsByTeam, 'total_engaged_users')
    : calculateAverage(metrics, 'total_engaged_users');
  const secondaryTotalEngagedUsers = team
    ? calculateAverage(metrics, 'total_engaged_users')
    : undefined;

  return (
    <Box display="flex" flexWrap="wrap" gap={3} justifyContent="space-between">
      <CardBox>
        <Card
          valueIsOnlyForLastDay
          team={team}
          title="Total Assigned seats"
          primaryValue={primaryValue}
          secondaryValue={secondaryValue}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <FunctionsIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          valueIsOnlyForLastDay
          team={team}
          title="Never used seats"
          primaryValue={primaryUnusedSeatValue}
          secondaryValue={secondaryUnusedSeatValue}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <FunctionsIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          team={team}
          title="Avg. Total Active Users"
          primaryValue={avgTotalActiveUsers}
          secondaryValue={secondaryTotalActiveUsers}
          startDate={startDate}
          endDate={endDate}
          rangeSuffix="(Excluding weekends)"
          icon={() => (
            <TimelineIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          team={team}
          title="Avg. Total Engaged Users"
          primaryValue={avgTotalEngagedUsers}
          secondaryValue={secondaryTotalEngagedUsers}
          startDate={startDate}
          endDate={endDate}
          rangeSuffix="(Excluding weekends)"
          icon={() => (
            <TimelineIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          valueIsOnlyForLastDay
          team={team}
          title="Inactive seats last 7 days"
          primaryValue={primaryInactive7DaysValue}
          secondaryValue={secondaryInactive7DaysValue}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <FunctionsIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          valueIsOnlyForLastDay
          team={team}
          title="Inactive seats last 14 days"
          primaryValue={primaryInactive14DaysValue}
          secondaryValue={secondaryInactive14DaysValue}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <FunctionsIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </CardBox>
      <CardBox>
        <Card
          valueIsOnlyForLastDay
          team={team}
          title="Inactive seats last 28 days"
          primaryValue={primaryInactive28DaysValue}
          secondaryValue={secondaryInactive28DaysValue}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <FunctionsIcon style={{ color: '#4CAF50' }} fontSize="large" />
          )}
        />
      </CardBox>
      <Box
        display="flex"
        flexWrap="nowrap"
        gap={3}
        justifyContent="space-between"
        width="100%"
      >
        <CardBox>
          <Card
            team={team}
            title="Avg. IDE Completions Users"
            primaryValue={avgIdeCompletionsUsers}
            secondaryValue={secondaryIdeCompletionsUsers}
            startDate={startDate}
            endDate={endDate}
            rangeSuffix="(Excluding weekends)"
            icon={() => (
              <TimelineIcon style={{ color: '#4CAF50' }} fontSize="large" />
            )}
          />
        </CardBox>
        <CardBox>
          <Card
            team={team}
            title="Avg. IDE Chat Users"
            primaryValue={avgIdeChatUsers}
            secondaryValue={secondaryIdeChatUsers}
            startDate={startDate}
            endDate={endDate}
            rangeSuffix="(Excluding weekends)"
            icon={() => (
              <TimelineIcon style={{ color: '#4CAF50' }} fontSize="large" />
            )}
          />
        </CardBox>
        <CardBox>
          <Card
            team={team}
            title="Avg. Dotcom Chat Users"
            primaryValue={avgDotcomChatsUsers}
            secondaryValue={secondaryDotcomChatsUsers}
            startDate={startDate}
            endDate={endDate}
            rangeSuffix="(Excluding weekends)"
            icon={() => (
              <TimelineIcon style={{ color: '#4CAF50' }} fontSize="large" />
            )}
          />
        </CardBox>
        <CardBox>
          <Card
            team={team}
            title="Avg. Dotcom PR Users"
            primaryValue={avgDotcomPrsUsers}
            secondaryValue={secondaryDotcomPrsUsers}
            startDate={startDate}
            endDate={endDate}
            rangeSuffix="(Excluding weekends)"
            icon={() => (
              <TimelineIcon style={{ color: '#4CAF50' }} fontSize="large" />
            )}
          />
        </CardBox>
      </Box>
    </Box>
  );
};
