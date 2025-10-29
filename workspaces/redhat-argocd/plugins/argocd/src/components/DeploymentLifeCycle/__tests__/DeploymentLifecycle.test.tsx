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
import { PropsWithChildren } from 'react';

import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import { createTheme, ThemeProvider } from '@material-ui/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import { useArgocdConfig } from '../../../hooks/useArgocdConfig';
import DeploymentLifecycle from '../DeploymentLifecycle';
import { useArgoResources } from '../sidebar/rollouts/RolloutContext';
import { argoCDApiRef } from '../../../api';
import { mockUseTranslation } from '../../../test-utils/mockTranslations';

jest.mock('../../../hooks/useArgocdConfig', () => ({
  useArgocdConfig: jest.fn(),
}));
jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));
jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('../sidebar/rollouts/RolloutContext', () => ({
  ...jest.requireActual('../sidebar/rollouts/RolloutContext'),
  useArgoResources: jest.fn(),
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: mockEntity,
  }),
}));

jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  ResponseErrorPanel: ({ error }: { error: Error }) => (
    <div data-testid="error-panel">{JSON.stringify(error)}</div>
  ),
}));

// Mock for configApiRef
const mockConfigApi = {
  getOptionalBoolean: jest.fn().mockReturnValue(false),
};

// Mock for ArgoCDApiRef
const mockArgoCDAPI = {
  listApps: jest.fn().mockResolvedValue({ items: [mockApplication] }),
  getRevisionDetailsList: jest.fn().mockResolvedValue({
    commit: 'commit message',
    author: 'test-user',
    date: new Date(),
  }),
};

/**
 * Replaces useApi's implementation with a version that:
 *   - returns mockConfigApi when called with configApiRef
 *   - returns an Argo API mock when called with argoCDApiRef
 *   - returns {} for anything else
 *
 * You can override Argo methods per test by passing functions in `argoImpl`
 */
function setUseApi(argoImpl: {
  listApps?: jest.Mock | (() => Promise<any>);
  getRevisionDetailsList?: jest.Mock | (() => Promise<any>);
}) {
  (useApi as jest.Mock).mockImplementation((ref: any) => {
    if (ref === configApiRef) return mockConfigApi;
    if (ref === argoCDApiRef) {
      return {
        listApps: argoImpl.listApps ?? mockArgoCDAPI.listApps,
        getRevisionDetailsList:
          argoImpl.getRevisionDetailsList ??
          mockArgoCDAPI.getRevisionDetailsList,
      };
    }
    return {};
  });
}

describe('DeploymentLifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useArgoResources as jest.Mock).mockReturnValue({ rollouts: [] });
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });

    (useArgocdConfig as any).mockReturnValue({
      baseUrl: 'https://baseurl.com',
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });

    // Setup useAPI implementation mock with defaults
    setUseApi({});
  });

  it('should render Permission alert if the user does not have view permission', () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    const { getByTestId } = render(<DeploymentLifecycle />);
    expect(getByTestId('no-permission-alert')).toBeInTheDocument();
  });

  test('should render the loader component', async () => {
    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.getByTestId('argocd-loader')).toBeInTheDocument();
    });
  });

  test('should render deployment lifecycle component', async () => {
    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();

      screen.getByText('Deployment lifecycle');
      screen.getByTestId('quarkus-app-dev-card');
    });
  });

  const theme = createTheme({
    palette: {
      type: 'dark',
    },
  });

  const Providers = ({ children }: PropsWithChildren) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );

  test('should render components in dark theme', async () => {
    render(
      <Providers>
        <DeploymentLifecycle />
      </Providers>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();

      screen.getByText('Deployment lifecycle');
      screen.getByTestId('quarkus-app-dev-card');
    });
  });

  test('should catch the error while fetching revision details', async () => {
    setUseApi({
      getRevisionDetailsList: jest
        .fn()
        .mockRejectedValue(new Error('500: Internal server error')),
    });

    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();

      screen.getByText('Deployment lifecycle');
      screen.getByTestId('quarkus-app-dev-card');
    });
  });

  test('should catch the error while fetching applications', async () => {
    setUseApi({
      listApps: jest
        .fn()
        .mockRejectedValue(new Error('500: Internal server error')),
    });

    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();
      screen.getByTestId('error-panel');
    });
  });

  test('should not render the component if there are no applications matching the selector', async () => {
    setUseApi({
      listApps: jest.fn().mockResolvedValue({ items: [] }),
      getRevisionDetailsList: jest.fn().mockResolvedValue({}),
    });

    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Deployment lifecycle'),
      ).not.toBeInTheDocument();
    });
  });

  test('should open and close the sidebar', async () => {
    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();
      screen.getByText('Deployment lifecycle');

      screen.getByTestId('quarkus-app-dev-card');
    });

    fireEvent.click(screen.getByTestId('quarkus-app-dev-card'));

    await waitFor(() => {
      screen.getByTestId('quarkus-app-dev-drawer');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close the drawer' }));

    await waitFor(() => {
      expect(
        screen.queryByTestId('quarkus-app-dev-drawer'),
      ).not.toBeInTheDocument();
    });
  });
});
