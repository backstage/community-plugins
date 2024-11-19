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
import React, { ElementType, ReactNode, useMemo } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { InfoCard } from '@backstage/core-components';
import { DateTime } from 'luxon';

type CardItemProps = {
  team?: string;
  title: string;
  primaryValue: number | string;
  secondaryValue?: number | string;
  startDate: Date;
  endDate: Date;
  icon: ElementType<ReactNode>;
};

const format = 'dd/MM/yyyy';

const TextGroup = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const FooterText = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 0, 0, 0),
  justifyContent: 'center',
}));

export const Card = ({
  team,
  title,
  primaryValue,
  secondaryValue,
  startDate,
  endDate,
  icon,
}: CardItemProps) => {
  const message = useMemo(() => {
    if (primaryValue === 'N/A') return `No data available`;

    const endDateTime = DateTime.fromJSDate(endDate);
    const now = DateTime.now();
    const isYesterday = endDateTime.hasSame(now.minus({ days: 1 }), 'day');

    if (isYesterday) {
      const startDateTime = DateTime.fromJSDate(startDate);
      const daysDifference = endDateTime.diff(startDateTime, 'days').days + 1;

      return daysDifference > 1
        ? `Over the last ${Math.round(daysDifference)} days`
        : 'Over the last day';
    }

    return `From ${DateTime.fromJSDate(startDate).toFormat(
      format,
    )} to ${endDateTime.toFormat(format)}`;
  }, [primaryValue, startDate, endDate]);

  return (
    <InfoCard divider={false}>
      <Box display="flex" alignItems="center">
        <Icon component={icon} />
        <TextGroup>
          <Typography color="primary" variant="subtitle2" component="h2">
            {title}
          </Typography>
          <Stack direction="row" gap={2} alignItems="flex-end">
            <Tooltip title={team && secondaryValue ? team : 'Overall'}>
              <Typography
                variant="h3"
                component="h2"
                color="textPrimary"
                mb={0}
              >
                {primaryValue}
              </Typography>
            </Tooltip>
            <Tooltip title={team && secondaryValue && 'Overall'}>
              <Typography
                variant="h6"
                component="h5"
                color="textSecondary"
                mb={0}
              >
                {secondaryValue}
              </Typography>
            </Tooltip>
          </Stack>
        </TextGroup>
      </Box>
      <Divider />
      <Box>
        <FooterText color="textSecondary" variant="caption">
          {message}
        </FooterText>
      </Box>
    </InfoCard>
  );
};
