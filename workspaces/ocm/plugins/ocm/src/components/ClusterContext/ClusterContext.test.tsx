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
import { useEntity } from '@backstage/plugin-catalog-react';

import { render } from '@testing-library/react';

import data from '../../../__fixtures__/cluster1.json';
import { ClusterContextProvider } from './ClusterContext';

const mockEntity = {
  apiVersion: 'backstage.io/v1beta1',
  kind: 'Resource',
  spec: { owner: 'unknown', type: 'kubernetes-cluster' },
  metadata: {
    name: 'foo',
    namespace: 'default',
    annotations: {
      'backstage-community.io/ocm-provider-id': 'hub',
    },
  },
};

jest.mock('../ClusterContext/', () => ({
  useCluster: jest.fn().mockReturnValue({}),
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn().mockReturnValue({}),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: () => ({
    getClusterByName: () => data,
  }),
}));

describe('ClusterContext', () => {
  beforeEach(() => {
    (useEntity as jest.Mock).mockClear();
  });

  it('should render children', () => {
    (useEntity as jest.Mock).mockReturnValue({ entity: mockEntity });
    const { getByText } = render(
      <ClusterContextProvider>Child</ClusterContextProvider>,
    );

    expect(getByText('Child')).toBeInTheDocument();
  });
});
