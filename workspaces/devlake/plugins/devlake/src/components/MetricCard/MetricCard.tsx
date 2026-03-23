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

/* eslint-disable @backstage/no-undeclared-imports */
import {
  Card,
  CardContent,
  Typography,
  Chip,
  makeStyles,
} from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import {
  DoraMetric,
  DORA_LEVEL_COLORS,
  DORA_LEVEL_LABELS,
} from '@backstage-community/plugin-devlake-common';

const useStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  value: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  unit: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(0.5),
  },
  trendPositive: {
    color: '#4CAF50',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  trendNegative: {
    color: '#F44336',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  trendIcon: {
    fontSize: '1rem',
    marginRight: 2,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
  },
}));

/** @internal */
export interface MetricCardProps {
  title: string;
  metric: DoraMetric;
  invertTrend?: boolean;
}

/** @internal */
export const MetricCard = (props: MetricCardProps) => {
  const { title, metric, invertTrend = false } = props;
  const classes = useStyles();

  const isPositiveTrend = invertTrend ? metric.trend <= 0 : metric.trend >= 0;

  return (
    <Card className={classes.card}>
      <CardContent>
        <div className={classes.header}>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Chip
            label={DORA_LEVEL_LABELS[metric.level]}
            size="small"
            style={{
              backgroundColor: DORA_LEVEL_COLORS[metric.level],
              color: '#fff',
            }}
          />
        </div>
        <div className={classes.valueRow}>
          <Typography className={classes.value}>{metric.value}</Typography>
          <Typography className={classes.unit}>{metric.unit}</Typography>
        </div>
        {metric.trend !== 0 && (
          <Typography
            className={
              isPositiveTrend ? classes.trendPositive : classes.trendNegative
            }
          >
            {metric.trend > 0 ? (
              <ArrowUpwardIcon className={classes.trendIcon} />
            ) : (
              <ArrowDownwardIcon className={classes.trendIcon} />
            )}
            {Math.abs(metric.trend)}%
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
