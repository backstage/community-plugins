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
  Grid,
  Chip,
  Badge,
} from '@material-ui/core';
import CodeIcon from '@material-ui/icons/Code';
import { FindingAnalytics } from '../utils/defectDojoUtils';
import { useDefectDojoStyles } from '../shared/styles';

interface CweAnalysisProps {
  analytics: FindingAnalytics;
}

export const CweAnalysis: React.FC<CweAnalysisProps> = ({ analytics }) => {
  const classes = useDefectDojoStyles();

  return (
    <Grid container spacing={2}>
      {/* Top CWEs */}
      <Grid item md={12}>
        <Card className={classes.metricCard}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <CodeIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Top CWE (Common Weakness Enumeration)
            </Typography>
            {analytics.topCWEs.map(cweData => (
              <Box
                key={cweData.cwe}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                marginBottom={1}
              >
                <Chip
                  label={`CWE-${cweData.cwe}`}
                  className={classes.cweChip}
                  size="small"
                />
                <Typography variant="body2" style={{ flex: 1, marginLeft: 8 }}>
                  {cweData.title}
                </Typography>
                <Badge badgeContent={cweData.count} color="secondary" />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
