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
import { usePermission } from '@backstage/plugin-permission-react';

import { renderInTestApp } from '@backstage/test-utils';

import { TektonCIComponent } from './TektonCIComponent';

// mock useTektonObjectsResponse hook
jest.mock('../../hooks/useTektonObjectsResponse', () => ({
  useTektonObjectsResponse: () => ({
    watchResourcesData: {
      pipelineruns: {
        data: [],
      },
      taskruns: {
        data: [],
      },
    },
    loaded: true,
    responseError: '',
    selectedClusterErrors: [],
    clusters: [],
    setSelectedCluster: () => {},
  }),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('TektonComponent', () => {
  beforeEach(() => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
  });

  it('should render Permission alert if the user does not have view permission', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    const { getByTestId } = await renderInTestApp(<TektonCIComponent />);
    expect(getByTestId('no-permission-alert')).toBeInTheDocument();
  });

  it('should render TektonComponent', async () => {
    const { getByText } = await renderInTestApp(<TektonCIComponent />);
    expect(getByText(/No Pipeline Runs found/i)).not.toBeNull();
  });

  it('should render Process', async () => {
    mockUsePermission.mockReturnValue({ loading: true, allowed: false });
    const { getByTestId } = await renderInTestApp(<TektonCIComponent />);
    expect(getByTestId('tekton-permission-progress')).toBeInTheDocument();
  });
});
