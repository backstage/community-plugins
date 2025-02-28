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

import { ResourceSyncStatus } from '../ResourcesSyncStatus';
import { SyncIcon } from '../../../../AppStatus/StatusIcons';
import { SyncStatusCode } from '@backstage-community/plugin-redhat-argocd-common';

jest.mock('../../../../AppStatus/StatusIcons', () => ({
  SyncIcon: jest.fn(() => <span>Mocked Sync Icon</span>),
}));

describe('ResourceSyncStatus Component', () => {
  const renderComponent = (syncStatus: string) => {
    render(<ResourceSyncStatus syncStatus={syncStatus} />);
  };

  it('should render the sync status text correctly', () => {
    const syncStatus = 'Synced';
    renderComponent(syncStatus);

    expect(screen.getByText(syncStatus)).toBeInTheDocument();
  });

  it('should render the SyncIcon with the correct status', () => {
    const syncStatus = 'OutOfSync';
    renderComponent(syncStatus);

    expect(SyncIcon).toHaveBeenCalledWith(
      { status: syncStatus as SyncStatusCode },
      {},
    );
  });

  it('should display both the sync icon and status text', () => {
    const syncStatus = 'Unknown';
    renderComponent(syncStatus);

    expect(screen.getByText('Mocked Sync Icon')).toBeInTheDocument();
    expect(screen.getByText(syncStatus)).toBeInTheDocument();
  });
});
