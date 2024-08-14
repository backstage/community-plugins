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
import LanguageIcon from '@mui/icons-material/Language';
import Grid from '@mui/material/Grid';
import { Card } from './Card';
import { getLanguageStats } from '../../utils';
import { CardsProps } from '../../types';

export const LanguageCards = ({
  metrics,
  startDate,
  endDate,
}: PropsWithChildren<CardsProps>) => {
  const languageStats = getLanguageStats(metrics);

  return (
    <Grid container justifyContent="space-between">
      <Grid xs={6} item>
        <Card
          title="Nº of Languages"
          value={metrics.length ? languageStats.length : 'N/A'}
          startDate={startDate}
          endDate={endDate}
          icon={() => (
            <LanguageIcon style={{ color: '#007acc' }} fontSize="large" />
          )}
        />
      </Grid>
    </Grid>
  );
};
