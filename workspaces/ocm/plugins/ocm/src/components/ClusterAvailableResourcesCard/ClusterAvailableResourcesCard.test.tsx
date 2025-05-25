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
import { renderInTestApp } from '@backstage/test-utils';

import abortedCluster from '../../../__fixtures__/aborted-cluster.json';
import clusterOne from '../../../__fixtures__/cluster1.json';
import { useCluster } from '../ClusterContext';
import { ClusterAvailableResourceCard } from './ClusterAvailableResourcesCard';

jest.mock('../ClusterContext/', () => ({
  useCluster: jest.fn().mockReturnValue({}),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  RequirePermission: jest
    .fn()
    .mockImplementation(({ permission, children }) => (
      <div>
        {`${permission}`}
        {children}
      </div>
    )),
}));

describe('ClusterAvailableResourceCard', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the table', async () => {
    (useCluster as jest.Mock).mockReturnValue({ data: clusterOne });
    const { getByText } = await renderInTestApp(
      <ClusterAvailableResourceCard />,
    );

    expect(getByText('96')).toBeInTheDocument();
    expect(getByText('503 Gi')).toBeInTheDocument();
    expect(getByText('750')).toBeInTheDocument();
  });

  it('should render nothing when there is no cluster data', async () => {
    (useCluster as jest.Mock).mockReturnValue({});
    const { queryByText } = await renderInTestApp(
      <ClusterAvailableResourceCard />,
    );

    expect(queryByText('96')).toBeNull();
    expect(queryByText('503 Gi')).toBeNull();
    expect(queryByText('750')).toBeNull();
  });

  it('should render nothing when available resources are missing', async () => {
    (useCluster as jest.Mock).mockReturnValue({ data: abortedCluster });
    const { queryByText } = await renderInTestApp(
      <ClusterAvailableResourceCard />,
    );

    expect(queryByText('96')).toBeNull();
    expect(queryByText('503 Gi')).toBeNull();
    expect(queryByText('750')).toBeNull();
  });
});
