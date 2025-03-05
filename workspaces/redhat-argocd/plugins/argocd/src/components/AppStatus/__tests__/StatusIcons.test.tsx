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

import { render, screen } from '@testing-library/react';

import {
  HealthStatus,
  SyncStatusCode,
} from '@backstage-community/plugin-redhat-argocd-common';
import { AppHealthIcon, SyncIcon } from '../StatusIcons';

describe('StatusIcons', () => {
  describe('Sync Status', () => {
    test('should return application sync icon', () => {
      render(<SyncIcon status="Synced" />);
      expect(screen.getByTestId('synced-icon')).toBeInTheDocument();

      render(<SyncIcon status="OutOfSync" />);
      expect(screen.getByTestId('outofsync-icon')).toBeInTheDocument();

      render(<SyncIcon status="Unknown" />);
      expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();

      render(<SyncIcon status={'invalid' as SyncStatusCode} />);
      expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    });
  });

  describe('Health Status', () => {
    test('should return application health status icon', () => {
      render(<AppHealthIcon status={HealthStatus.Healthy} />);
      expect(screen.getByTestId('healthy-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Suspended} />);
      expect(screen.getByTestId('suspended-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Progressing} />);
      expect(screen.getByTestId('progressing-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Missing} />);
      expect(screen.getByTestId('missing-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Degraded} />);
      expect(screen.getByTestId('degraded-icon')).toBeInTheDocument();

      render(<AppHealthIcon status={HealthStatus.Unknown} />);
      expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    });
  });
});
