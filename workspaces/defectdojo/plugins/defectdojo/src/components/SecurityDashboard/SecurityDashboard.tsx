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
import { Typography, Box, Card, CardContent, Button } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import SecurityIcon from '@material-ui/icons/Security';
import { useDefectDojoStyles } from '../shared/styles';
import { SeverityMetrics, FindingAnalytics } from '../utils/defectDojoUtils';

const getStatusText = (
  loading: boolean,
  total: number,
  hasData: boolean,
): string => {
  if (loading) {
    return 'Loading...';
  }
  if (!loading && total === 0 && hasData) {
    return 'No Vulnerabilities';
  }
  return 'Active Findings';
};

interface SecurityDashboardProps {
  metrics: SeverityMetrics;
  analytics: FindingAnalytics;
  loading: boolean;
  hasData: boolean;
  defectdojoBaseUrl?: string;
  onOpenDefectDojo: () => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  metrics,
  analytics,
  loading,
  hasData,
  defectdojoBaseUrl,
  onOpenDefectDojo,
}) => {
  const classes = useDefectDojoStyles();

  return (
    <Card
      className={`${classes.metricCard} ${
        !loading && metrics.total === 0 && hasData ? classes.successCard : ''
      }`}
    >
      <CardContent style={{ textAlign: 'center' }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          marginBottom={2}
        >
          {!loading && metrics.total === 0 && hasData ? (
            <CheckCircleIcon style={{ fontSize: 60, color: '#4caf50' }} />
          ) : (
            <SecurityIcon style={{ fontSize: 60, color: '#2196f3' }} />
          )}
        </Box>

        <Typography
          className={`${classes.totalFindings} ${
            !loading && metrics.total === 0 && hasData
              ? classes.successNumber
              : ''
          }`}
        >
          {loading ? '...' : metrics.total}
        </Typography>

        <Typography variant="h6" color="textSecondary" gutterBottom>
          {getStatusText(loading, metrics.total, hasData)}
        </Typography>

        {!loading && metrics.total > 0 && (
          <Box marginTop={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Risk Level
            </Typography>
            <Box
              className={classes.riskScore}
              style={{ backgroundColor: analytics.riskScore.color }}
            >
              {analytics.riskScore.level} ({analytics.riskScore.score}%)
            </Box>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<OpenInNewIcon />}
          onClick={onOpenDefectDojo}
          className={classes.actionButton}
          fullWidth
          disabled={!defectdojoBaseUrl}
        >
          {defectdojoBaseUrl
            ? 'View in DefectDojo'
            : 'DefectDojo not configured'}
        </Button>
      </CardContent>
    </Card>
  );
};
