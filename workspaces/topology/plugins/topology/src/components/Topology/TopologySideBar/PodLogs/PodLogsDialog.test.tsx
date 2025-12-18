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
import { useContext } from 'react';

import { V1Pod } from '@kubernetes/client-node';
import { fireEvent, render } from '@testing-library/react';

import { mockKubernetesResponse } from '../../../../__fixtures__/1-deployments';
import { mockUseTranslation } from '../../../../test-utils/mockTranslations';
import { PodLogsDialog } from './PodLogsDialog';

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));
import { RequirePermission } from '@backstage/plugin-permission-react';

jest.mock('@backstage/plugin-permission-react', () => ({
  RequirePermission: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

jest.mock('@emotion/react', () => ({
  ...jest.requireActual('@emotion/react'),
  Styled: (props: any) => <div {...props} />,
}));

jest.mock('@mui/material/Dialog', () => (props: any) => (
  <div data-testid="dialog">{props.children}</div>
));
jest.mock('@mui/material/DialogContent', () => (props: any) => (
  <div data-testid="dialog-content">{props.children}</div>
));
jest.mock('@mui/material/DialogTitle', () => (props: any) => (
  <div data-testid="dialog-title">{props.children}</div>
));
jest.mock('@mui/material/Box', () => (props: any) => (
  <div data-testid="box">{props.children}</div>
));
jest.mock('@mui/material/Select', () => (props: any) => (
  <div data-testid="select">{props.children}</div>
));
jest.mock('@mui/material/IconButton', () => (props: any) => (
  <div data-testid="icon-button">{props.children}</div>
));
jest.mock('@mui/material/MenuItem', () => (props: any) => (
  <div data-testid="menu-item">{props.children}</div>
));
jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  WarningPanel: (props: any) => (
    <div data-testid="warning-panel">{props.children}</div>
  ),
  ErrorBoundary: (props: any) => (
    <div data-testid="error-boundary">{props.children}</div>
  ),
}));
jest.mock('./PodLogs', () => ({
  PodLogs: () => <div data-testid="pod-logs" />,
}));
jest.mock('@mui/icons-material/Close', () => () => <span>Close Icon</span>);
const RequirePermissionMock = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

describe('PodLogsDialog', () => {
  it('should show Dialog & View logs', () => {
    (useContext as jest.Mock).mockReturnValue({
      clusters: ['OCP'],
      selectedCluster: [0],
    });
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    const { queryByText, queryByTestId, getByRole } = render(
      <PodLogsDialog podData={mockKubernetesResponse.pods[0] as V1Pod} />,
    );
    const button = getByRole('button');

    fireEvent.click(button);
    expect(queryByText(/View Logs/i)).toBeInTheDocument();
    expect(queryByTestId('dialog')).toBeInTheDocument();
  });

  it('should not show Dialog & View logs', () => {
    (useContext as jest.Mock).mockReturnValue({
      clusters: [],
    });
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    const { queryByText, queryByTestId } = render(
      <PodLogsDialog podData={mockKubernetesResponse.pods[0] as V1Pod} />,
    );
    expect(queryByText(/View Logs/i)).not.toBeInTheDocument();
    expect(queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
