/*
 * Copyright 2025 The Backstage Authors
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
import {
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { getSeverityIcon } from '../utils/defectDojoUtils';
import { useDefectDojoStyles } from '../shared/styles';

interface MetricCardProps {
  title: string;
  count: number;
  total: number;
  severity: string;
  trend?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  total,
  severity,
  trend,
}) => {
  const classes = useDefectDojoStyles();
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const getCardClass = () => {
    const hasTrend = trend !== undefined && trend !== 0;
    switch (severity.toLowerCase()) {
      case 'critical':
        return hasTrend ? classes.criticalCardWithTrend : classes.criticalCard;
      case 'high':
        return hasTrend ? classes.highCardWithTrend : classes.highCard;
      case 'medium':
        return classes.mediumCard;
      case 'low':
        return classes.lowCard;
      default:
        return '';
    }
  };

  const getNumberClass = () => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return classes.criticalNumber;
      case 'high':
        return classes.highNumber;
      case 'medium':
        return classes.mediumNumber;
      case 'low':
        return classes.lowNumber;
      default:
        return '';
    }
  };

  return (
    <Card className={`${classes.metricCard} ${getCardClass()}`}>
      <CardContent style={{ padding: 12 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          marginBottom={1}
          flexWrap="wrap"
          gridGap={1}
        >
          <Box display="flex" alignItems="center">
            {getSeverityIcon(severity)}
            <Typography
              variant="subtitle1"
              style={{ marginLeft: 8, fontWeight: 600 }}
            >
              {title}
            </Typography>
          </Box>
          {trend !== undefined && trend !== 0 && (
            <Box display="flex" alignItems="center">
              {trend > 0 ? (
                <TrendingUpIcon style={{ fontSize: 14, color: '#f44336' }} />
              ) : (
                <TrendingUpIcon
                  style={{
                    fontSize: 14,
                    color: '#4caf50',
                    transform: 'rotate(180deg)',
                  }}
                />
              )}
              <Typography
                variant="caption"
                style={{
                  marginLeft: 2,
                  color: trend > 0 ? '#f44336' : '#4caf50',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                }}
              >
                {trend > 0 ? '+' : ''}
                {trend}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography className={`${classes.metricNumber} ${getNumberClass()}`}>
          {count}
        </Typography>

        <Box marginBottom={1}>
          <Typography variant="body2" color="textSecondary">
            {percentage.toFixed(1)}% of total
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={percentage}
          className={classes.progressBar}
          color={
            severity.toLowerCase() === 'critical' ||
            severity.toLowerCase() === 'high'
              ? 'secondary'
              : 'primary'
          }
        />
      </CardContent>
    </Card>
  );
};
