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

import { configApiRef } from '@backstage/core-plugin-api';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { fireEvent, render, screen } from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import {
  Application,
  Source,
} from '@backstage-community/plugin-redhat-argocd-common';
import DeploymentLifecycleDrawer from '../DeploymentLifecycleDrawer';
import { useArgoResources } from '../sidebar/rollouts/RolloutContext';
import { useDrawerContext } from '../DrawerContext';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    ...mockEntity,
    metadata: {
      ...mockEntity.metadata,
      annotations: {
        ...mockEntity.metadata.annotations,
        'gitlab.com/source-url': 'https://gitlab.com/testingrepo',
      },
    },
  }),
}));
jest.mock('../sidebar/rollouts/RolloutContext', () => ({
  ...jest.requireActual('../sidebar/rollouts/RolloutContext'),
  useArgoResources: jest.fn(),
}));
jest.mock('../DrawerContext', () => ({
  ...jest.requireActual('../DrawerContext'),
  useDrawerContext: jest.fn(),
}));

describe('DeploymentLifecycleDrawer', () => {
  beforeEach(() => {
    (useArgoResources as jest.Mock).mockReturnValue({ rollouts: [] });
    (useDrawerContext as jest.Mock).mockReturnValue({
      application: mockApplication,
      revisionsMap: {},
      appHistory: mockApplication?.status?.history,
      latestRevision: mockApplication?.status?.history?.[1],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new MockConfigApi({
              argocd: {
                appLocatorMethods: [
                  {
                    instances: [
                      {
                        name: 'main',
                        url: 'https://test.com',
                      },
                    ],
                    type: 'config',
                  },
                ],
              },
            }),
          ],
        ]}
      >
        {children}
      </TestApiProvider>
    );
  };
  test('should not render the application drawer component', () => {
    (useDrawerContext as jest.Mock).mockReturnValue({
      application: null as unknown as Application,
      revisionsMap: {},
    });

    render(<DeploymentLifecycleDrawer isOpen onClose={() => jest.fn()} />);

    expect(
      screen.queryByTestId('quarkus-app-dev-drawer'),
    ).not.toBeInTheDocument();
  });

  test('should render the application drawer component', () => {
    render(<DeploymentLifecycleDrawer isOpen onClose={() => jest.fn()} />, {
      wrapper,
    });

    expect(screen.getByTestId('quarkus-app-dev-drawer')).toBeInTheDocument();
  });

  test('should not render the commit section for helm based applications in drawer component', () => {
    const helmApplication = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        source: { ...mockApplication.spec.source, chart: 'redhat-charts' },
      },
    };
    (useDrawerContext as jest.Mock).mockReturnValue({
      application: helmApplication,
      revisionsMap: {},
    });

    render(<DeploymentLifecycleDrawer isOpen onClose={() => jest.fn()} />, {
      wrapper,
    });

    const commitLink = screen.queryByText('Commit');
    expect(commitLink).not.toBeInTheDocument();
  });

  test('should render the commit link in drawer component', () => {
    global.open = jest.fn();

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: mockApplication,
      revisionsMap: {
        '90f9758b7033a4bbb7c33a35ee474d61091644bc': {
          author: 'test user',
          message: 'commit message',
          date: new Date(),
        },
      },
      appHistory: mockApplication.status.history,
      latestRevision: mockApplication.status.history?.[1],
    });

    render(<DeploymentLifecycleDrawer isOpen onClose={() => jest.fn()} />, {
      wrapper,
    });
    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).toHaveBeenCalled();
    expect(global.open).toHaveBeenCalledWith(
      'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops',
      '_blank',
    );
  });

  test('should not open a new windown if the missing git url', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        source: undefined as unknown as Source,
      },
    };
    global.open = jest.fn();

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: remoteApplication,
      revisionsMap: {},
      appHistory: mockApplication.status.history,
      latestRevision: mockApplication.status.history?.[1],
    });

    render(<DeploymentLifecycleDrawer isOpen onClose={jest.fn()} />, {
      wrapper,
    });
    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).toHaveBeenCalledTimes(0);
  });

  test('should render remote cluster url', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        destination: {
          server: 'https://remote-url.com',
          namespace: 'remote-ns',
        },
      },
    };

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: remoteApplication,
      revisionsMap: {},
    });

    render(<DeploymentLifecycleDrawer isOpen onClose={jest.fn()} />, {
      wrapper,
    });

    expect(screen.queryByText('(in-cluster)')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('local-cluster-tooltip'),
    ).not.toBeInTheDocument();

    screen.getByText('https://remote-url.com');
  });
});
