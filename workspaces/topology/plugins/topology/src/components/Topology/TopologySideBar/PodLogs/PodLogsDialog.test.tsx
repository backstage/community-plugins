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
import React, { useContext } from 'react';

import { V1Pod } from '@kubernetes/client-node';
import { fireEvent, render } from '@testing-library/react';

import { mockKubernetesResponse } from '../../../../__fixtures__/1-deployments';
import { PodLogsDialog } from './PodLogsDialog';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  makeStyles: () => () => {
    return {
      titleContainer: 'title',
      closeButton: 'close',
    };
  },
  Dialog: () => <div data-testid="dialog" />,
}));

describe('PodLogsDialog', () => {
  it('should show Dialog & View logs', () => {
    (useContext as jest.Mock).mockReturnValue({
      clusters: ['OCP'],
      selectedCluster: [0],
    });
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
    const { queryByText, queryByTestId } = render(
      <PodLogsDialog podData={mockKubernetesResponse.pods[0] as V1Pod} />,
    );
    expect(queryByText(/View Logs/i)).not.toBeInTheDocument();
    expect(queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
