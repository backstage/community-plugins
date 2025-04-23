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

import data from '../../../__fixtures__/cluster1.json';
import { useCluster } from '../ClusterContext';
import { ClusterInfoCard } from './ClusterInfoCard';

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

jest.mock('../common', () => ({
  Status: () => 'Ready',
  Update: () => '4.10.26',
}));

describe('ClusterInfoCard', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the table', async () => {
    (useCluster as jest.Mock).mockReturnValue({ data: data });
    const { getByText } = await renderInTestApp(<ClusterInfoCard />);

    expect(getByText('foo')).toBeInTheDocument();
    expect(getByText('Ready')).toBeInTheDocument();
    expect(getByText('v1.23.5+012e945')).toBeInTheDocument();
    expect(
      getByText('91976abd-8b8e-47b9-82d3-e84793396ed7'),
    ).toBeInTheDocument();
    expect(getByText('4.10.26')).toBeInTheDocument();
    expect(getByText('BareMetal')).toBeInTheDocument();
  });

  it('should render nothing when there is no cluster data', async () => {
    (useCluster as jest.Mock).mockReturnValue({});
    const { queryByText } = await renderInTestApp(<ClusterInfoCard />);

    expect(queryByText('foo')).toBeNull();
    expect(queryByText('Ready')).toBeNull();
    expect(queryByText('v1.23.5+012e945')).toBeNull();
    expect(queryByText('91976abd-8b8e-47b9-82d3-e84793396ed7')).toBeNull();
    expect(queryByText('4.10.26')).toBeNull();
    expect(queryByText('BareMetal')).toBeNull();
  });
});
