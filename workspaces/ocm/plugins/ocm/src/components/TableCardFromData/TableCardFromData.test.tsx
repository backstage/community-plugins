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
import { TableCardFromData } from './TableCardFromData';

describe('TableCardFromData', () => {
  it('should render the cluster info', async () => {
    const clusterInfoNameMap = new Map<string, string>([
      ['name', 'Name'],
      ['kubernetesVersion', 'Kubernetes version'],
      ['openshiftId', 'OpenShift ID'],
      ['openshiftVersion', 'OpenShift version'],
      ['platform', 'Platform'],
    ]);

    const { getByText } = await renderInTestApp(
      <TableCardFromData
        data={data}
        title="Cluster Info"
        nameMap={clusterInfoNameMap}
      />,
    );

    expect(getByText('foo')).toBeInTheDocument();
    expect(getByText('v1.23.5+012e945')).toBeInTheDocument();
    expect(
      getByText('91976abd-8b8e-47b9-82d3-e84793396ed7'),
    ).toBeInTheDocument();
    expect(getByText('4.10.26')).toBeInTheDocument();
    expect(getByText('BareMetal')).toBeInTheDocument();
  });

  it('should render the available resources', async () => {
    const availableNameMap = new Map<string, string>([
      ['cpuCores', 'CPU cores'],
      ['memorySize', 'Memory size'],
      ['numberOfPods', 'Number of pods'],
    ]);

    const { getByText } = await renderInTestApp(
      <TableCardFromData
        data={data.availableResources}
        title="Available"
        nameMap={availableNameMap}
      />,
    );

    expect(getByText('96')).toBeInTheDocument();
    expect(getByText('503 Gi')).toBeInTheDocument();
    expect(getByText('750')).toBeInTheDocument();
  });

  it('should render nothing if there is an empty name map', async () => {
    const availableNameMap = new Map<string, string>([]);

    const { queryByText } = await renderInTestApp(
      <TableCardFromData
        data={data.availableResources}
        title="Available"
        nameMap={availableNameMap}
      />,
    );

    expect(queryByText('96')).toBeNull();
    expect(queryByText('503 Gi')).toBeNull();
    expect(queryByText('750')).toBeNull();
  });

  it('should ignore unknown keys in name map', async () => {
    const availableNameMap = new Map<string, string>([
      ['cpuCores', 'CPU cores'],
      ['memorySize', 'Memory size'],
      ['numberOfProds', 'Number of prods'],
    ]);

    const { queryByText } = await renderInTestApp(
      <TableCardFromData
        data={data.availableResources}
        title="Available"
        nameMap={availableNameMap}
      />,
    );

    expect(queryByText('96')).toBeInTheDocument();
    expect(queryByText('503 Gi')).toBeInTheDocument();
    expect(queryByText('Number of prods')).toBeNull();
  });
});
