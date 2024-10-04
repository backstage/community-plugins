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
import React from 'react';

import { Chip } from '@material-ui/core';

import { Application, HealthStatus } from '../../types/application';
import { AppHealthIcon } from './StatusIcons';

const AppHealthStatus: React.FC<{ app: Application; isChip?: boolean }> = ({
  app,
  isChip = false,
}) => {
  return isChip ? (
    <Chip
      data-testid="app-health-status-chip"
      size="small"
      variant="outlined"
      icon={<AppHealthIcon status={app.status.health.status as HealthStatus} />}
      label={app.status.health.status}
    />
  ) : (
    <>
      <AppHealthIcon status={app.status.health.status as HealthStatus} />{' '}
      {app.status.health.status}
    </>
  );
};

export default AppHealthStatus;
