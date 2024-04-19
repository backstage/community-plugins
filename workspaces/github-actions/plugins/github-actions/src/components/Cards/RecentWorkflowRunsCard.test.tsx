/*
 * Copyright 2020 The Backstage Authors
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

import { EntityProvider } from '@backstage/plugin-catalog-react';
import React from 'react';
import { useWorkflowRuns } from '../useWorkflowRuns';
import { RecentWorkflowRunsCard } from './RecentWorkflowRunsCard';

import { ConfigReader } from '@backstage/core-app-api';
import {
  ConfigApi,
  configApiRef,
  errorApiRef,
} from '@backstage/core-plugin-api';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { rootRouteRef } from '../../routes';
import { screen } from '@testing-library/react';

jest.mock('../useWorkflowRuns', () => ({
  useWorkflowRuns: jest.fn(),
}));

const mockErrorApi: jest.Mocked<typeof errorApiRef.T> = {
  post: jest.fn(),
  error$: jest.fn(),
};

const configApi: ConfigApi = new ConfigReader({});

describe('<RecentWorkflowRunsCard />', () => {
  const entity = {
    apiVersion: 'v1',
    kind: 'Component',
    metadata: {
      name: 'software',
      annotations: {
        'github.com/project-slug': 'theorg/the-service',
        'backstage.io/source-location':
          'url:https://ghes.acme.co/theorg/the-service/tree/main/',
      },
    },
    spec: {
      owner: 'guest',
      type: 'service',
      lifecycle: 'production',
    },
  };

  const workflowRuns = [1, 2, 3, 4, 5].map(n => ({
    id: `run-id-${n}`,
    message: `Commit message for workflow ${n}`,
    source: { branchName: `branch-${n}` },
    status: 'completed',
  }));

  beforeEach(() => {
    (useWorkflowRuns as jest.Mock).mockReturnValue([{ runs: workflowRuns }]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderSubject = async (props: any = {}) => {
    await renderInTestApp(
      <TestApiProvider
        apis={[
          [errorApiRef, mockErrorApi],
          [configApiRef, configApi],
        ]}
      >
        <EntityProvider entity={entity}>
          <RecentWorkflowRunsCard {...props} />
        </EntityProvider>
      </TestApiProvider>,
      {
        mountedRoutes: {
          '/ci-cd': rootRouteRef,
        },
      },
    );
  };

  it('renders a table with a row for each workflow', async () => {
    await renderSubject();

    workflowRuns.forEach(run => {
      expect(screen.getByText(run.message)).toBeInTheDocument();
    });
  });

  it('renders a workflow row correctly', async () => {
    await renderSubject();
    const [run] = workflowRuns;
    expect(screen.getByText(run.message).closest('a')).toHaveAttribute(
      'href',
      `/ci-cd/${run.id}`,
    );
    expect(screen.getByText(run.source.branchName)).toBeInTheDocument();
  });

  it('requests only the required number of workflow runs', async () => {
    const limit = 3;
    await renderSubject({ limit });
    expect(useWorkflowRuns).toHaveBeenCalledWith(
      expect.objectContaining({ initialPageSize: limit }),
    );
  });

  it('uses the github hostname, repo and owner from the entity annotations', async () => {
    await renderSubject();
    expect(useWorkflowRuns).toHaveBeenCalledWith(
      expect.objectContaining({
        hostname: 'ghes.acme.co',
        owner: 'theorg',
        repo: 'the-service',
      }),
    );
  });

  it('filters workflows by branch if one is specified', async () => {
    const branch = 'master';
    await renderSubject({ branch });
    expect(useWorkflowRuns).toHaveBeenCalledWith(
      expect.objectContaining({ branch }),
    );
  });

  describe('where there is an error fetching workflows', () => {
    const error = 'error getting workflows';
    beforeEach(() => {
      (useWorkflowRuns as jest.Mock).mockReturnValue([{ runs: [], error }]);
    });

    it('sends the error to the errorApi', async () => {
      await renderSubject();
      expect(mockErrorApi.post).toHaveBeenCalledWith(error);
    });
  });
});
