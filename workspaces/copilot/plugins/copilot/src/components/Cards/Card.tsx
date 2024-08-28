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
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';

type CardItemProps = {
  title: string;
  value: number | string;
  startDate: Date;
  endDate: Date;
  icon: ElementType<ReactNode>;
};

const format = 'dd/MM/yyyy';

const MainBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  borderRadius: 25,
  minWidth: 256,
  minHeight: 138,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
}));

const TextGroup = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const FooterText = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 0, 0, 0),
  justifyContent: 'center',
}));

export const Card = ({
  title,
  value,
  startDate,
  endDate,
  icon,
}: CardItemProps) => {
  const message = useMemo(() => {
    if (value === 'N/A') return `No data available`;

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
  }, [value, startDate, endDate]);

  return (
    <MainBox>
      <Box display="flex" alignItems="center">
        <Icon component={icon} />
        <TextGroup>
          <Typography color="textSecondary" variant="subtitle2" component="h2">
            {title}
          </Typography>
          <Typography variant="h3" component="h2">
            {value}
          </Typography>
        </TextGroup>
      </Box>
      <Divider />
      <Box>
        <FooterText color="textSecondary" variant="caption">
          {message}
        </FooterText>
      </Box>
    </MainBox>
  );
};
