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
import { fireEvent, render, screen } from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import { useArgocdConfig } from '../../../hooks/useArgocdConfig';
import {
  Application,
  Source,
} from '@backstage-community/plugin-redhat-argocd-common';
import DeploymentLifecycleCard from '../DeploymentLifecycleCard';
import { mockUseTranslation } from '../../../test-utils/mockTranslations';

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

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

jest.mock('../../../hooks/useArgocdConfig', () => ({
  useArgocdConfig: jest.fn(),
}));

describe('DeploymentLifecylceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useArgocdConfig as any).mockReturnValue({
      baseUrl: '',
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });
  });

  test('should not render if the application is not passed', () => {
    render(
      <DeploymentLifecycleCard
        app={null as unknown as Application}
        revisions={[]}
      />,
    );

    expect(
      screen.queryByTestId('quarkus-app-dev-card'),
    ).not.toBeInTheDocument();
  });
  test('should render if the application card', () => {
    render(<DeploymentLifecycleCard app={mockApplication} revisions={[]} />);
    expect(screen.getByTestId('quarkus-app-dev-card')).toBeInTheDocument();
  });

  test('application header should link to external link', () => {
    render(<DeploymentLifecycleCard app={mockApplication} revisions={[]} />);
    const link = screen.getByTestId('quarkus-app-dev-link');
    fireEvent.click(link);

    expect(link).toHaveAttribute(
      'href',
      'https://main-instance-url.com/applications/quarkus-app-dev',
    );
  });

  test('should render incluster tooltip', () => {
    render(<DeploymentLifecycleCard app={mockApplication} revisions={[]} />);

    fireEvent.mouseDown(screen.getByText('(in-cluster)'));
    expect(screen.getByTestId('local-cluster-tooltip')).toBeInTheDocument();
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
    render(<DeploymentLifecycleCard app={remoteApplication} revisions={[]} />);

    expect(screen.queryByText('(in-cluster)')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('local-cluster-tooltip'),
    ).not.toBeInTheDocument();

    screen.getByText('https://remote-url.com');
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

    render(<DeploymentLifecycleCard app={remoteApplication} revisions={[]} />);
    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).toHaveBeenCalledTimes(0);
  });

  test('application card should contain commit link', () => {
    (useArgocdConfig as any).mockReturnValue({
      baseUrl: 'https://baseUrl.com',
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });

    global.open = jest.fn();

    render(
      <DeploymentLifecycleCard
        app={mockApplication}
        revisions={[
          {
            revisionID: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
            author: 'test user',
            message: 'commit message',
            date: new Date(),
          },
        ]}
      />,
    );

    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).toHaveBeenCalled();
    expect(global.open).toHaveBeenCalledWith(
      'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops',
      '_blank',
    );
    screen.getByText('commit message');
  });
});

test('application card should not contain commit section for helm based applications', () => {
  (useArgocdConfig as any).mockReturnValue({
    baseUrl: 'https://baseUrl.com',
    instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
    intervalMs: 10000,
    instanceName: 'main',
  });

  const helmApplication = {
    ...mockApplication,
    spec: {
      ...mockApplication.spec,
      source: { ...mockApplication.spec.source, chart: 'redhat-charts' },
    },
  };

  render(<DeploymentLifecycleCard app={helmApplication} revisions={[]} />);

  const commitLink = screen.queryByText('Commit');
  expect(commitLink).not.toBeInTheDocument();
});
