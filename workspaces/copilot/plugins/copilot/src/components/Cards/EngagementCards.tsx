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
import { PropsWithChildren } from 'react';
import FunctionsIcon from '@mui/icons-material/Functions';
import TimelineIcon from '@mui/icons-material/Timeline';
import Box from '@mui/material/Box';
import { Card } from './Card';
import { EngagementCardsProps } from '../../types';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';

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
  // Helper function to find the data point for the end date
  const findLatestDataPoint = (dataArray: any[]) => {
    if (!dataArray || dataArray.length === 0) return null;

    // Format endDate to YYYY-MM-DD for comparison
    const endDateTime = DateTime.fromJSDate(endDate);
    const formattedEndDate = endDateTime.toFormat('yyyy-MM-dd');

    // Find the data point with day matching endDate
    const matchingPoint = dataArray.find(item => {
      if (!item.day) return false;
      // Format item.day to YYYY-MM-DD for comparison
      const itemDate = DateTime.fromISO(item.day)
        .toLocal()
        .toFormat('yyyy-MM-dd');
      return itemDate === formattedEndDate;
    });

    // Return matching point or null if not found
    return matchingPoint || null;
  };

  // Get the most recent data points
  const latestTeamSeat = findLatestDataPoint(seatsByTeam);
  const latestSeat = findLatestDataPoint(seats);

  let primaryValue = 'N/A';
  if ((team && latestTeamSeat) || latestSeat) {
    primaryValue =
      team && latestTeamSeat
        ? latestTeamSeat.total_seats
        : latestSeat?.total_seats || 'N/A';
  }

  let secondaryValue: number | undefined = undefined;
  if (latestSeat) {
    secondaryValue = team ? latestSeat.total_seats : undefined;
  }

  let primaryUnusedSeatValue = 'N/A';
  if ((team && latestTeamSeat) || latestSeat) {
    primaryUnusedSeatValue =
      team && latestTeamSeat
        ? latestTeamSeat.seats_never_used
        : latestSeat?.seats_never_used || 'N/A';
  }

  let secondaryUnusedSeatValue: number | undefined = undefined;
  if (latestSeat) {
    secondaryUnusedSeatValue = team ? latestSeat.seats_never_used : undefined;
  }

  // Seats inactive for 7 days
  let primaryInactive7DaysValue = 'N/A';
  if ((team && latestTeamSeat) || latestSeat) {
    primaryInactive7DaysValue =
      team && latestTeamSeat
        ? latestTeamSeat.seats_inactive_7_days
        : latestSeat?.seats_inactive_7_days || 'N/A';
  }

  let secondaryInactive7DaysValue: number | undefined = undefined;
  if (latestSeat) {
    secondaryInactive7DaysValue = team
      ? latestSeat.seats_inactive_7_days
      : undefined;
  }

  // Seats inactive for 14 days
  let primaryInactive14DaysValue = 'N/A';
  if ((team && latestTeamSeat) || latestSeat) {
    primaryInactive14DaysValue =
      team && latestTeamSeat
        ? latestTeamSeat.seats_inactive_14_days
        : latestSeat?.seats_inactive_14_days || 'N/A';
  }

  let secondaryInactive14DaysValue: number | undefined = undefined;
  if (latestSeat) {
    secondaryInactive14DaysValue = team
      ? latestSeat.seats_inactive_14_days
      : undefined;
  }

  // Seats inactive for 28 days
  let primaryInactive28DaysValue = 'N/A';
  if ((team && latestTeamSeat) || latestSeat) {
    primaryInactive28DaysValue =
      team && latestTeamSeat
        ? latestTeamSeat.seats_inactive_28_days
        : latestSeat?.seats_inactive_28_days || 'N/A';
  }

  let secondaryInactive28DaysValue: number | undefined = undefined;
  if (latestSeat) {
    secondaryInactive28DaysValue = team
      ? latestSeat.seats_inactive_28_days
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
