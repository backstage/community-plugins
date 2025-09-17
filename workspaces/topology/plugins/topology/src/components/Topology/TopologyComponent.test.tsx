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
import { useTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';

import { mockUseTranslation } from '../../test-utils/mockTranslations';
import { TopologyComponent } from './TopologyComponent';
import { usePermission } from '@backstage/plugin-permission-react';

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  makeStyles: jest.fn().mockReturnValue(() => ({})),
  useTheme: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../hooks/useK8sObjectsResponse', () => ({
  useK8sObjectsResponse: () => ({
    watchResourcesData: {
      deployments: {
        data: [],
      },
      pods: {
        data: [],
      },
    },
    loading: false,
    responseError: '',
    selectedClusterErrors: [],
    clusters: [],
    setSelectedCluster: () => {},
  }),
}));

jest.mock('./TopologyWorkloadView', () => ({
  TopologyWorkloadView: () => <div>TopologyWorkloadView</div>,
}));

const useThemeMock = useTheme as jest.Mock;
jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('TopologyComponent', () => {
  it('should render TopologyComponent', () => {
    useThemeMock.mockReturnValue({
      palette: {
        mode: 'dark',
      },
    });
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    const { getByText } = render(<TopologyComponent />);
    expect(getByText(/topologyworkloadview/i)).not.toBeNull();
  });

  it('should render PermissionMissing page when permissions are missing', () => {
    useThemeMock.mockReturnValue({
      palette: {
        mode: 'dark',
      },
    });
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    const { getByText, queryByText } = render(<TopologyComponent />);
    expect(getByText('Missing Permission')).toBeInTheDocument();
    expect(queryByText(/topologyworkloadview/i)).toBeNull();
  });

  it('should render loading when permissions are loading', () => {
    useThemeMock.mockReturnValue({
      palette: {
        mode: 'dark',
      },
    });
    mockUsePermission.mockReturnValue({ loading: true, allowed: false });
    const { queryByText, getByTestId } = render(<TopologyComponent />);
    expect(getByTestId('topology-progress')).toBeInTheDocument();
    expect(queryByText(/topologyworkloadview/i)).toBeNull();
  });

  it('should show dark theme', () => {
    useThemeMock.mockReturnValue({
      palette: {
        mode: 'dark',
      },
    });
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    render(<TopologyComponent />);
    const htmlTagElement = document.documentElement;
    expect(htmlTagElement.classList.contains('pf-v6-theme-dark')).toBe(true);
  });

  it('should show light theme', () => {
    useThemeMock.mockReturnValue({
      palette: {
        mode: 'light',
      },
    });
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    render(<TopologyComponent />);
    const htmlTagElement = document.documentElement;
    expect(htmlTagElement.classList.contains('pf-v6-theme-dark')).toBe(false);
  });
});
