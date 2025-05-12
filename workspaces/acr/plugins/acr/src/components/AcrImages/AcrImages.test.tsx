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
import { ErrorPanelProps } from '@backstage/core-components';
import { renderInTestApp } from '@backstage/test-utils';

import { mockAcrTagsData } from '../../__fixtures__/acrTagsObject';

import { AcrImages } from './AcrImages';
import { useTags } from '../../hooks/useTags';

jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  ErrorPanel: ({ error }: ErrorPanelProps) => <div>{error.toString()}</div>,
}));

jest.mock('../../hooks/useTags', () => ({
  useTags: jest.fn(),
}));

const useTagsMock = useTags as jest.Mock;

describe('AcrImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render repository view', async () => {
    const mockAsyncData = {
      loading: false,
      value: {
        tags: mockAcrTagsData.tags,
      },
    };
    useTagsMock.mockReturnValue(mockAsyncData);
    const { queryAllByRole, getByText } = await renderInTestApp(
      <AcrImages image="sample/node" />,
    );
    expect(queryAllByRole('progressbar')).toHaveLength(0);
    expect(getByText('1.0.0')).toBeInTheDocument();
  });

  it('should show loading', async () => {
    const mockAsyncData = {
      loading: true,
    };
    useTagsMock.mockReturnValue(mockAsyncData);
    const { queryByRole } = await renderInTestApp(
      <AcrImages image="sample/node" />,
    );
    expect(queryByRole('progressbar')).toBeInTheDocument();
  });

  it('should show error', async () => {
    const mockAsyncData = {
      loading: false,
      error: 'something went wrong!!',
    };
    useTagsMock.mockReturnValue(mockAsyncData);
    const { queryByRole, getByText } = await renderInTestApp(
      <AcrImages image="sample/node" />,
    );
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
    getByText(/something went wrong!!/i);
  });
});
