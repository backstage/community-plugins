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
import { render } from '@testing-library/react';

import abortedCluster from '../../__fixtures__/aborted-cluster.json';
import clusterOne from '../../__fixtures__/cluster1.json';
import offlineCluster from '../../__fixtures__/offline-cluster.json';
import { Status, Update } from './common';

jest.mock('@backstage/core-components', () => ({
  StatusOK: () => 'StatusOK',
  StatusError: () => 'StatusError',
  StatusAborted: () => 'StatusAborted',
}));

describe('Status', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should show a Ready status', () => {
    const { getByText } = render(<Status status={clusterOne.status} />);

    expect(getByText(/StatusOK/i)).toBeInTheDocument();
  });

  it('should show a Not Ready status', () => {
    const { getByText } = render(<Status status={offlineCluster.status} />);

    expect(getByText(/StatusError/i)).toBeInTheDocument();
  });
});

describe('Update', () => {
  it('should show that there is an Update', () => {
    const version = clusterOne.openshiftVersion;
    const update = clusterOne.update;
    const { getByText } = render(<Update data={{ version, update }} />);

    expect(getByText('Upgrade available')).toBeInTheDocument();
  });

  it('should show that there is no Update', () => {
    const version = abortedCluster.openshiftVersion;
    const update = abortedCluster.update;
    const { queryByText } = render(<Update data={{ version, update }} />);

    expect(queryByText('4.10.51')).toBeInTheDocument();
    expect(queryByText('Upgrade available')).toBeNull();
  });
});
