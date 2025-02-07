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
import useAsync from 'react-use/esm/useAsync';

import { ErrorPanelProps } from '@backstage/core-components';

import { render } from '@testing-library/react';

import { mockAcrTagsData } from '../../__fixtures__/acrTagsObject';
import { AcrImages } from './AcrImages';

jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  ErrorPanel: ({ error }: ErrorPanelProps) => <div>{error.toString()}</div>,
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getTags: jest.fn(),
  }),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => jest.fn().mockReturnValue({ chip: '' }),
}));

jest.mock('react-use/esm/useAsync', () =>
  jest.fn().mockReturnValue({ loading: true }),
);

describe('AcrImages', () => {
  beforeEach(() => {
    (useAsync as jest.Mock).mockClear();
  });

  it('should render repository view', () => {
    const mockAsyncData = {
      loading: false,
      value: {
        tags: mockAcrTagsData.tags,
      },
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    const { queryByRole, getByText } = render(
      <AcrImages image="sample/node" />,
    );
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
    expect(getByText('1.0.0')).toBeInTheDocument();
  });

  it('should show loading', () => {
    const mockAsyncData = {
      loading: true,
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    const { queryByRole } = render(<AcrImages image="sample/node" />);
    expect(queryByRole('progressbar')).toBeInTheDocument();
  });

  it('should show error', () => {
    const mockAsyncData = {
      loading: false,
      error: 'something went wrong!!',
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    const { queryByRole, getByText } = render(
      <AcrImages image="sample/node" />,
    );
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
    getByText(/something went wrong!!/i);
  });
});
