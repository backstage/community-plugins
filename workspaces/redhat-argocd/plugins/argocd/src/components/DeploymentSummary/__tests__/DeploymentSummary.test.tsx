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

import { usePermission } from '@backstage/plugin-permission-react';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import { useApplications } from '../../../hooks/useApplications';
import { useArgocdConfig } from '../../../hooks/useArgocdConfig';
import {
  Application,
  History,
} from '@backstage-community/plugin-redhat-argocd-common';
import DeploymentSummary from '../DeploymentSummary';

jest.mock('../../../hooks/useArgocdConfig', () => ({
  useArgocdConfig: jest.fn(),
}));

jest.mock('../../../hooks/useApplications', () => ({
  useApplications: jest.fn(),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: mockEntity,
  }),
}));

describe('DeploymentSummary', () => {
  beforeEach(() => {
    (useApplications as any).mockReturnValue({
      apps: [mockApplication],
      loading: false,
      error: undefined,
    });

    mockUsePermission.mockReturnValue({ loading: false, allowed: true });

    (useArgocdConfig as any).mockReturnValue({
      baseUrl: '',
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });
  });

  test('should render loading indicator', async () => {
    (useApplications as any).mockReturnValue({
      apps: [],
      loading: true,
      error: undefined,
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  test('should render empty table incase of no applications', async () => {
    (useApplications as any).mockReturnValue({
      apps: [],
      loading: false,
      error: undefined,
    });

    (useArgocdConfig as any).mockReturnValue({
      baseUrl: 'https://baseurl.com',
      instances: [{ name: 'test', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryByText('No records to display')).toBeInTheDocument();
    });
  });
  test('should not render deployment summary table when the user does not have view permission', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryByText('Deployment summary')).not.toBeInTheDocument();
    });
  });

  test('should not render deployment summary table incase of error', async () => {
    (useApplications as any).mockReturnValue({
      apps: [],
      loading: false,
      error: new Error('500: Internal server error'),
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryByText('Deployment summary')).not.toBeInTheDocument();
    });
  });

  test('should render deployment summary', async () => {
    (useArgocdConfig as any).mockReturnValue({
      instances: [{ name: 'test', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'test',
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryAllByText('quarkus-app-dev')).toBeDefined();
      expect(screen.queryByText('Healthy')).toBeInTheDocument();
      expect(screen.queryByText('Synced')).toBeInTheDocument();
    });
  });

  test('should link the application to instance url', async () => {
    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'quarkus-app-dev' }),
      ).toHaveAttribute(
        'href',
        'https://main-instance-url.com/applications/quarkus-app-dev',
      );
    });
  });

  test('should link the application to the base argocd url', async () => {
    (useArgocdConfig as any).mockReturnValue({
      baseUrl: 'https://baseurl.com',
      instances: [],
      intervalMs: 10000,
      instanceName: 'main',
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      screen.getByText('Healthy');
      screen.getByText('Synced');

      expect(
        screen.getByRole('link', { name: 'quarkus-app-dev' }),
      ).toHaveAttribute(
        'href',
        'https://baseurl.com/applications/quarkus-app-dev',
      );
    });
  });

  test('should sort by last deployment time', async () => {
    const mockApplicationTwo: Application = {
      ...mockApplication,
      status: {
        ...mockApplication.status,
        history: [
          {
            ...(mockApplication?.status?.history?.[0] as History),
            revision: '12345',
          },
          {
            ...(mockApplication?.status?.history?.[1] as History),
            revision: 'abcde',
            deployedAt: new Date().toISOString(),
          },
        ],
      },
    };

    (useApplications as any).mockReturnValue({
      apps: [mockApplication, mockApplicationTwo],
      loading: false,
      error: undefined,
    });

    render(<DeploymentSummary />);
    const lastDeployedHeader = screen.getByRole('button', {
      name: 'Last deployed',
    });

    await waitFor(() => {
      const tableBody = screen.queryAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).queryAllByRole('row')[0];

      within(firstRow).getByText('90f9758');
    });
    await fireEvent.click(lastDeployedHeader);
    // miui table requires two clicks to start sorting
    await fireEvent.click(lastDeployedHeader);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      const tableBody = screen.queryAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).queryAllByRole('row')[0];

      within(firstRow).getByText('abcde');
    });
  });

  test('should sort by last deployment time even if the history is missing for some applications', async () => {
    const mockApplicationTwo: Application = {
      ...mockApplication,
      status: {
        ...mockApplication.status,
        history: undefined,
      },
    };

    (useApplications as any).mockReturnValue({
      apps: [mockApplication, mockApplicationTwo],
      loading: false,
      error: undefined,
    });

    render(<DeploymentSummary />);

    const lastDeployedHeader = screen.getByRole('button', {
      name: 'Last deployed',
    });

    await waitFor(() => {
      const tableBody = screen.queryAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).queryAllByRole('row')[0];

      expect(within(firstRow).queryByText('90f9758')).toBeInTheDocument();
    });
    await fireEvent.click(lastDeployedHeader);
    // miui table requires two clicks to start sorting
    await fireEvent.click(lastDeployedHeader);

    await waitFor(() => {
      const tableBody = screen.queryAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).queryAllByRole('row')[0];

      expect(within(firstRow).getByText('-')).toBeInTheDocument();
    });
  });

  test('should sort by application sync status', async () => {
    const mockApplicationTwo: Application = {
      ...mockApplication,
      status: {
        ...mockApplication.status,
        sync: {
          status: 'OutOfSync',
        },
      },
    };

    (useApplications as any).mockReturnValue({
      apps: [mockApplication, mockApplicationTwo],
      loading: false,
      error: undefined,
    });

    render(<DeploymentSummary />);
    const syncStatusHeader = screen.getByRole('button', {
      name: 'Sync status',
    });

    await waitFor(() => {
      const tableBody = screen.queryAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).queryAllByRole('row')[0];

      within(firstRow).getByText('Synced');
    });
    await fireEvent.click(syncStatusHeader);
    // miui table requires two clicks to start sorting
    await fireEvent.click(syncStatusHeader);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      const tableBody = screen.queryAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).queryAllByRole('row')[0];

      expect(within(firstRow).getByText('OutOfSync')).toBeInTheDocument();
    });
  });

  test('should sort by application health status', async () => {
    const mockApplicationTwo: Application = {
      ...mockApplication,
      status: {
        ...mockApplication.status,
        health: {
          status: 'Degraded',
        },
      },
    };

    (useApplications as any).mockReturnValue({
      apps: [mockApplication, mockApplicationTwo],
      loading: false,
      error: undefined,
    });

    render(<DeploymentSummary />);
    const healthStatusHeader = screen.getByRole('button', {
      name: 'Health status',
    });

    await waitFor(() => {
      const tableBody = screen.queryAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).queryAllByRole('row')[0];

      expect(within(firstRow).queryByText('Healthy')).toBeInTheDocument();
    });
    await fireEvent.click(healthStatusHeader);
    // miui table requires two clicks to start sorting
    await fireEvent.click(healthStatusHeader);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      const tableBody = screen.queryAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).queryAllByRole('row')[0];

      expect(within(firstRow).getByText('Degraded')).toBeInTheDocument();
    });
  });
});
