import React from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { fireEvent, render, screen } from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import { Application, Source } from '../../../types/application';
import DeploymentLifecycleDrawer from '../DeploymentLifecycleDrawer';
import { useArgoResources } from '../sidebar/rollouts/RolloutContext';

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

describe('DeploymentLifecycleDrawer', () => {
  beforeEach(() => {
    (useArgoResources as jest.Mock).mockReturnValue({ rollouts: [] });
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
    render(
      <DeploymentLifecycleDrawer
        app={null as unknown as Application}
        isOpen
        onClose={() => jest.fn()}
        revisionsMap={{}}
      />,
    );

    expect(
      screen.queryByTestId('quarkus-app-dev-drawer'),
    ).not.toBeInTheDocument();
  });

  test('should render the application drawer component', () => {
    render(
      <DeploymentLifecycleDrawer
        app={mockApplication}
        isOpen
        onClose={() => jest.fn()}
        revisionsMap={{}}
      />,
      { wrapper },
    );

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
    render(
      <DeploymentLifecycleDrawer
        app={helmApplication}
        isOpen
        onClose={() => jest.fn()}
        revisionsMap={{}}
      />,
      { wrapper },
    );

    const commitLink = screen.queryByText('Commit');
    expect(commitLink).not.toBeInTheDocument();
  });

  test('should render the commit link in drawer component', () => {
    global.open = jest.fn();

    render(
      <DeploymentLifecycleDrawer
        app={mockApplication}
        isOpen
        onClose={() => jest.fn()}
        revisionsMap={{
          '90f9758b7033a4bbb7c33a35ee474d61091644bc': {
            author: 'test user',
            message: 'commit message',
            date: new Date(),
          },
        }}
      />,
      { wrapper },
    );
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

    render(
      <DeploymentLifecycleDrawer
        isOpen
        onClose={jest.fn()}
        app={remoteApplication}
        revisionsMap={{}}
      />,
      { wrapper },
    );
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
    render(
      <DeploymentLifecycleDrawer
        isOpen
        onClose={jest.fn()}
        app={remoteApplication}
        revisionsMap={{}}
      />,
      { wrapper },
    );

    expect(screen.queryByText('(in-cluster)')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('local-cluster-tooltip'),
    ).not.toBeInTheDocument();

    screen.getByText('https://remote-url.com');
  });
});
