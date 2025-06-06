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
import { MaturitySummary } from '@backstage-community/plugin-tech-insights-maturity-common';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import Stack from '@mui/material/Stack';
import { AreaProgress } from '../../helpers/AreaProgress';

type Props = {
  summary: MaturitySummary | undefined;
  variant?: 'gridItem' | 'infoCard';
};

export const MaturitySummaryCardContent = ({ summary, variant }: Props) => {
  if (summary && summary.areaSummaries.length > 0) {
    return (
      <Stack spacing={1}>
        {summary.areaSummaries.map(x => (
          <AreaProgress areaSummary={x} variant={variant} key={x.area} />
        ))}
      </Stack>
    );
  } else if (summary) {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        No checks available.
      </Typography>
    );
  }
  return <LinearProgress color="secondary" variant="indeterminate" />;
};
