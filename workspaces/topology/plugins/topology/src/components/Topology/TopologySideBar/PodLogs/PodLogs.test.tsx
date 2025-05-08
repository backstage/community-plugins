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

import { usePodLogs } from '../../../../hooks/usePodLogs';
import { PodLogs } from './PodLogs';

jest.mock('../../../../hooks/usePodLogs', () => ({
  usePodLogs: jest.fn(),
}));

jest.mock('@backstage/core-components', () => ({
  LogViewer: () => <div data-testid="log-viewer">Log viewer</div>,
  DismissableBanner: () => (
    <div data-testid="pod-log-banner">Dismissable banner</div>
  ),
}));

describe('PodLogs', () => {
  it('should render logviewer', () => {
    const podScopeData = {
      podName: 'node-ex-git-er56',
      podNamespace: 'sample-app',
      containerName: 'node-ex-git',
      clusterName: 'OCP',
    };
    (usePodLogs as jest.Mock).mockReturnValue({
      loading: false,
      value: 'log data...',
    });
    const { queryByTestId } = render(
      <PodLogs podScope={podScopeData} setLogText={() => {}} stopPolling />,
    );
    expect(queryByTestId('pod-log-banner')).not.toBeInTheDocument();
    expect(queryByTestId('log-viewer')).toBeInTheDocument();
  });

  it('should render logviewer skeleton', () => {
    const podScopeData = {
      podName: 'node-ex-git-er56',
      podNamespace: 'sample-app',
      containerName: 'node-ex-git',
      clusterName: 'OCP',
    };
    (usePodLogs as jest.Mock).mockReturnValue({ loading: true });
    const { queryByTestId } = render(
      <PodLogs podScope={podScopeData} setLogText={() => {}} stopPolling />,
    );
    expect(queryByTestId('pod-log-banner')).not.toBeInTheDocument();
    expect(queryByTestId('log-viewer')).not.toBeInTheDocument();
    expect(queryByTestId('logs-skeleton')).toBeInTheDocument();
  });

  it('should render DismissableBanner in case of error', () => {
    const podScopeData = {
      podName: 'node-ex-git-er56',
      podNamespace: 'sample-app',
      containerName: 'node-ex-git',
      clusterName: 'OCP',
    };
    (usePodLogs as jest.Mock).mockReturnValue({
      loading: false,
      error: { message: 'some crash!!' },
    });
    const { queryByTestId } = render(
      <PodLogs podScope={podScopeData} setLogText={() => {}} stopPolling />,
    );
    expect(queryByTestId('pod-log-banner')).toBeInTheDocument();
    expect(queryByTestId('log-viewer')).not.toBeInTheDocument();
    expect(queryByTestId('logs-skeleton')).not.toBeInTheDocument();
  });
});
