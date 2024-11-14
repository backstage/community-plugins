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
import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { downloadLogFile } from '@janus-idp/shared-react';

import { testPipelineRunPods } from '../../../__fixtures__/pods-data';
import { getPodLogs } from '../../../utils/log-downloader-utils';
import PodLogsDownloadLink from '../PodLogsDownloadLink';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('../../../utils/log-downloader-utils', () => ({
  getPodLogs: jest.fn(),
}));

jest.mock('@janus-idp/shared-react', () => ({
  ...jest.requireActual('@janus-idp/shared-react'),
  downloadLogFile: jest.fn(),
}));

const getPodLogsMock = getPodLogs as jest.Mock;
const downloadLogFileMock = downloadLogFile as jest.Mock;

describe('PodLogsDownloadLink', () => {
  beforeEach(() => {
    getPodLogsMock.mockResolvedValue('');
    downloadLogFileMock.mockResolvedValue('download complete');
  });

  it('should download the pipelineRun logs', async () => {
    const { pods } = testPipelineRunPods;

    render(
      <PodLogsDownloadLink
        data-testid="download-pipelinerun-logs"
        pods={pods}
        fileName="pipelinerun.log"
        downloadTitle="Download all task logs"
      />,
    );
    fireEvent.click(screen.getByTestId('download-pipelinerun-logs'));

    await waitFor(() => {
      expect(
        screen.getByTestId('download-pipelinerun-logs'),
      ).toBeInTheDocument();

      expect(getPodLogsMock).toHaveBeenCalled();
      expect(downloadLogFileMock).toHaveBeenCalled();
    });
  });

  it('should disable download button during download and enable it back the process is complete', async () => {
    getPodLogsMock.mockResolvedValue('');
    downloadLogFileMock.mockResolvedValue('download complete');

    const { pods } = testPipelineRunPods;
    render(
      <PodLogsDownloadLink
        data-testid="download-pipelinerun-logs"
        pods={pods}
        fileName="pipelinerun.log"
        downloadTitle="Download all task logs"
      />,
    );

    fireEvent.click(screen.getByTestId('download-pipelinerun-logs'));

    expect(screen.getByTestId('download-pipelinerun-logs')).toHaveAttribute(
      'disabled',
    );

    expect(
      screen.getByTestId('download-pipelinerun-logs').getAttribute('title'),
    ).toBe('downloading logs');

    await waitFor(() => {
      expect(
        screen.getByTestId('download-pipelinerun-logs'),
      ).not.toHaveAttribute('disabled');
      expect(
        screen.getByTestId('download-pipelinerun-logs').getAttribute('title'),
      ).toBe('Download all task logs');
    });
  });

  it('should re-enable download button incase of any errors during download', async () => {
    getPodLogsMock.mockRejectedValue('logs download error');
    downloadLogFileMock.mockResolvedValue('');

    const { pods } = testPipelineRunPods;
    render(
      <PodLogsDownloadLink
        data-testid="download-pipelinerun-logs"
        pods={pods}
        fileName="pipelinerun.log"
        downloadTitle="Download all task logs"
      />,
    );

    fireEvent.click(screen.getByTestId('download-pipelinerun-logs'));

    expect(screen.getByTestId('download-pipelinerun-logs')).toHaveAttribute(
      'disabled',
    );

    expect(
      screen.getByTestId('download-pipelinerun-logs').getAttribute('title'),
    ).toBe('downloading logs');

    await waitFor(() => {
      expect(
        screen.getByTestId('download-pipelinerun-logs'),
      ).not.toHaveAttribute('disabled');
      expect(
        screen.getByTestId('download-pipelinerun-logs').getAttribute('title'),
      ).toBe('Download all task logs');
    });
  });
});
