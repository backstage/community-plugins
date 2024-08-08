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
import { Box, Divider, Icon, Typography, makeStyles } from '@material-ui/core';
import dayjs from 'dayjs';

type CardItemProps = {
  title: string;
  value: number | string;
  startDate: Date;
  endDate: Date;
  icon: ElementType<ReactNode>;
};

const useStyles = makeStyles(theme => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 25,
    minWidth: 256,
    minHeight: 138,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 2, 2, 2),
  },
  textGroup: {
    padding: theme.spacing(1, 1, 1, 1),
  },
  footer: {
    padding: theme.spacing(1, 0, 0, 0),
    justifyContent: 'center',
  },
}));

const format = 'DD/MM/YYYY';

export const Card = ({
  title,
  value,
  startDate,
  endDate,
  icon,
}: CardItemProps) => {
  const classes = useStyles();

  const message = useMemo(() => {
    if (value === 'N/A') return `No data available`;

    const isYesterday = dayjs(endDate).isSame(dayjs().add(-1, 'day'), 'day');

    if (isYesterday) {
      const daysDifference = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;

      return daysDifference > 1
        ? `Over the last ${daysDifference} days`
        : 'Over the last day';
    }

    return `From ${dayjs(startDate).format(format)} to ${dayjs(endDate).format(
      format,
    )}`;
  }, [value, startDate, endDate]);

  return (
    <Box className={classes.main}>
      <Box display="flex" alignItems="center">
        <Icon component={icon} />
        <Box className={classes.textGroup}>
          <Typography color="textSecondary" variant="subtitle2" component="h2">
            {title}
          </Typography>
          <Typography variant="h3" component="h2">
            {value}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box>
        <Typography
          color="textSecondary"
          variant="caption"
          component="span"
          className={classes.footer}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
};
