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
import { BrowserRouter } from 'react-router-dom';

import { usePermission } from '@backstage/plugin-permission-react';

import { render } from '@testing-library/react';

import { useTags } from '../../hooks';
import { QuayRepository } from './QuayRepository';

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockReturnValue({ loading: true }),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValue({ getOptionalString: (param: any) => param }),
}));

jest.mock('../../hooks/', () => ({
  useRepository: () => ({
    repository: 'redhat-backstage-build',
    organization: 'backstage-community',
  }),
  useTags: jest.fn().mockReturnValue({}),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('QuayRepository', () => {
  beforeEach(() => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render permission alert when user does not have view permission', () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    const { queryByTestId } = render(<QuayRepository />);

    expect(queryByTestId('no-permission-alert')).toBeInTheDocument();

    expect(queryByTestId('quay-repo-progress')).toBeNull();
    expect(queryByTestId('quay-repo-table')).toBeNull();
  });

  it('should show loading if loading is true', () => {
    (useTags as jest.Mock).mockReturnValue({ loading: true, data: [] });
    const { getByTestId } = render(<QuayRepository />);
    expect(getByTestId('quay-repo-progress')).not.toBeNull();
  });

  it('should show empty table if loaded and data is not present', () => {
    (useTags as jest.Mock).mockReturnValue({ loading: false, data: [] });
    const { getByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );
    expect(getByTestId('quay-repo-table')).not.toBeNull();
    expect(getByTestId('quay-repo-table-empty')).not.toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(queryByText('There are no images available.')).toBeInTheDocument();
  });

  it('should show table if loaded and data is present', () => {
    (useTags as jest.Mock).mockReturnValue({
      loading: false,
      data: [
        {
          name: 'latest',
          manifest_digest:
            'sha256:e766248d812bcdadc1ee293b564af1f2517dd6c0327eefab2411e4f11e980d54',
          size: null,
          last_modified: 'Wed, 15 Mar 2023 18:22:18 -0000',
        },
      ],
    });
    const { queryByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );
    expect(queryByTestId('quay-repo-table')).not.toBeNull();
    expect(queryByTestId('quay-repo-table-empty')).toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(
      queryByText('There are no images available.'),
    ).not.toBeInTheDocument();
  });

  it('should show table if loaded and data is present but shows progress if security scan is not loaded', () => {
    (useTags as jest.Mock).mockReturnValue({
      loading: false,
      data: [
        {
          name: 'latest',
          manifest_digest: undefined,
          size: null,
          last_modified: 'Wed, 15 Mar 2023 18:22:18 -0000',
        },
      ],
    });
    const { queryByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );
    expect(queryByTestId('quay-repo-table')).not.toBeNull();
    expect(queryByTestId('quay-repo-table-empty')).toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(queryByTestId('quay-repo-security-scan-progress')).not.toBeNull();
  });

  it('should show queued status for the tag that are waiting in the queue to be scanned', () => {
    (useTags as jest.Mock).mockReturnValue({
      loading: false,
      data: [
        {
          name: 'latest',
          manifest_digest: undefined,
          securityStatus: 'queued',
          size: null,
          last_modified: 'Wed, 15 Mar 2023 18:22:18 -0000',
        },
      ],
    });
    const { queryByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );

    expect(queryByTestId('quay-repo-table')).not.toBeNull();
    expect(queryByTestId('quay-repo-table-empty')).toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(queryByTestId('quay-repo-queued-for-scan')).not.toBeNull();
  });

  it('should show table if loaded and data is present but shows unsupported if security scan is not supported', () => {
    (useTags as jest.Mock).mockReturnValue({
      loading: false,
      data: [
        {
          name: 'latest',
          manifest_digest: undefined,
          securityStatus: 'unsupported',
          size: null,
          last_modified: 'Wed, 15 Mar 2023 18:22:18 -0000',
        },
      ],
    });
    const { queryByTestId, queryByText } = render(
      <BrowserRouter>
        <QuayRepository />
      </BrowserRouter>,
    );
    expect(queryByTestId('quay-repo-table')).not.toBeNull();
    expect(queryByTestId('quay-repo-table-empty')).toBeNull();
    expect(queryByText(/Quay repository/i)).toBeInTheDocument();
    expect(queryByTestId('quay-repo-security-scan-unsupported')).not.toBeNull();
  });
});
