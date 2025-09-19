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
import { render, screen } from '@testing-library/react';
import DeploymentMetadata from '../DeploymentMetadata';
import {
  Application,
  Resource,
  Source,
} from '@backstage-community/plugin-redhat-argocd-common';
import { useDrawerContext } from '../../../../DrawerContext';
import { mockApplication, mockEntity } from '../../../../../../../dev/__data__';
import { useEntity } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { configApiRef, ApiRef } from '@backstage/core-plugin-api';
import { Config } from '@backstage/config';
import { mockUseTranslation } from '../../../../../../test-utils/mockTranslations';

jest.mock('../../../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

const resource: Resource = {
  group: 'apps',
  version: 'v1',
  kind: 'Deployment',
  namespace: 'openshift-gitops',
  name: 'quarkus-app',
  status: 'Synced',
  health: {
    status: 'Degraded',
  },
};

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
}));

jest.mock('../../../../DrawerContext', () => ({
  ...jest.requireActual('../../../../DrawerContext'),
  useDrawerContext: jest.fn(),
}));

const mockConfigApi = {
  // argocd.fullDeploymentHistory
  getOptionalBoolean: jest.fn().mockReturnValue(false),
};

const defaultApis: readonly [readonly [ApiRef<Config>, Partial<Config>]] = [
  [configApiRef, mockConfigApi],
];

const renderWithApis = (
  component: React.ReactElement,
  apis?: readonly [readonly [ApiRef<Config>, Partial<Config>]] | undefined,
) => {
  return render(
    <TestApiProvider apis={apis ?? defaultApis}>{component}</TestApiProvider>,
  );
};

describe('DeploymentMetadata', () => {
  it('should render Deployment Metadata', () => {
    (useEntity as jest.Mock).mockReturnValue({ entity: mockEntity });

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: mockApplication,
      revisions: [
        {
          author: 'test user',
          message: 'commit message',
          date: new Date(),
        },
      ],
      appHistory: mockApplication.status.history,
      latestRevision: mockApplication.status.history?.[1],
    });

    renderWithApis(<DeploymentMetadata resource={resource} />);

    expect(screen.getByText('Deployment history')).toBeInTheDocument();
    expect(screen.getByTestId('90f97-commit-link')).toBeInTheDocument();
  });

  it('should render Deployment Metadata with duplicate revisions if allowed', () => {
    (useEntity as jest.Mock).mockReturnValue({ entity: mockEntity });

    const mockConfigApiTrue = {
      getOptionalBoolean: jest.fn().mockReturnValue(true),
    };

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: mockApplication,
      revisions: [
        {
          author: 'test user',
          message: 'commit message',
          date: new Date(),
          revisionID: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
        },
        {
          author: 'test user',
          message: 'commit message',
          date: new Date(),
          revisionID: '90f9758b7033a4bbb7c33a35ee474d61091644bc',
        },
      ],
      appHistory: mockApplication.status.history,
      latestRevision: mockApplication.status.history?.[1],
    });

    const apis: readonly [readonly [ApiRef<Config>, Partial<Config>]] = [
      [configApiRef, mockConfigApiTrue],
    ];
    renderWithApis(<DeploymentMetadata resource={resource} />, apis);

    expect(screen.getByText('Deployment history')).toBeInTheDocument();
    expect(screen.getByTestId('90f97-commit-link')).toBeInTheDocument();
    // We should see two of the same revisions shown in the child components
    expect(
      screen.getAllByTestId(
        'commit-sha-90f9758b7033a4bbb7c33a35ee474d61091644bc',
      ).length,
    ).toBe(2);
  });

  it('should not render application history', () => {
    (useEntity as jest.Mock).mockReturnValue({ entity: mockEntity });

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: mockApplication,
      revisions: [{}],
      appHistory: [],
      latestRevision: mockApplication.status.history?.[1],
    });

    renderWithApis(<DeploymentMetadata resource={resource} />);

    expect(screen.queryByText('Deployment history')).not.toBeInTheDocument();
  });
  it('should render image link', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        source: undefined as unknown as Source,
      },
    };

    (useEntity as jest.Mock).mockReturnValue({ entity: null });

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: remoteApplication,
      revisions: [{}],
      appHistory: remoteApplication.status.history,
      latestRevision: remoteApplication.status.history?.[1],
    });

    renderWithApis(<DeploymentMetadata resource={resource} />);

    expect(screen.queryByText('quarkus-app:latest')).toBeInTheDocument();
  });

  it('should not render commit for helm based application', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        source: {
          ...mockApplication.spec.source,
          chart: 'bitnami',
        },
      },
    };

    (useEntity as jest.Mock).mockReturnValue({ entity: null });

    (useDrawerContext as jest.Mock).mockReturnValue({
      application: remoteApplication,
      revisions: [{}],
      appHistory: remoteApplication.status.history,
      latestRevision: remoteApplication.status.history?.[1],
    });

    renderWithApis(<DeploymentMetadata resource={resource} />);

    expect(screen.queryByText('commit message')).not.toBeInTheDocument();
  });
});
