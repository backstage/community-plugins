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

import { fireEvent, render, screen } from '@testing-library/react';

import { downloadLogFile } from '@janus-idp/shared-react';

import PodLogsDownload from './PodLogsDownload';

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  IconButton: ({ children, ...rest }: React.PropsWithChildren<any>) => (
    <button {...rest}>{children}</button>
  ),
}));

jest.mock('@material-ui/icons/GetApp', () => () => <div>DownloadIcon</div>);

jest.mock('@janus-idp/shared-react', () => ({
  downloadLogFile: jest.fn(),
}));

describe('PodLogsDownload', () => {
  it('renders null when logText is not provided', () => {
    render(<PodLogsDownload fileName="example" />);
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
  });

  it('renders the component with Download button when logText is provided', () => {
    render(<PodLogsDownload logText="Some logs" fileName="example" />);
    const downloadButton = screen.getByRole('button', {
      name: /download logs/i,
    });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveTextContent('Download');
  });

  it('calls downloadLogFile function with correct arguments when Download button is clicked', () => {
    const logText = 'Some logs';
    const fileName = 'example';
    render(<PodLogsDownload logText={logText} fileName={fileName} />);
    const downloadButton = screen.getByRole('button', {
      name: /download logs/i,
    });

    fireEvent.click(downloadButton);
    expect(downloadLogFile).toHaveBeenCalledWith(logText, `${fileName}.log`);
  });
});
