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
import { useParams } from 'react-router-dom';

import { errorApiRef } from '@backstage/core-plugin-api';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';
import { usePermission } from '@backstage/plugin-permission-react';
import { mockApis, MockErrorApi, TestApiProvider } from '@backstage/test-utils';

import { render } from '@testing-library/react';

import { useTagDetails } from '../../hooks';
import QuayTagPage from './component';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValue({ getOptionalString: (param: any) => param }),
  useRouteRef: jest.fn(),
}));

jest.mock('../../hooks/', () => ({
  useRepository: () => ({
    repository: 'redhat-backstage-build',
    organization: 'backstage-community',
  }),
  useTags: jest.fn().mockReturnValue({}),
  useTagDetails: jest.fn().mockReturnValue({}),
}));

jest.mock('../QuayTagDetails', () => ({
  QuayTagDetails: () => <div>QuayTagDetails</div>,
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('QuayTagPage', () => {
  beforeEach(() => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render permission alert when user does not have view permission', () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    (useParams as jest.Mock).mockReturnValue({ digest: 'digest_data' });

    const { queryByText, queryByTestId } = render(<QuayTagPage />);

    expect(queryByTestId('no-permission-alert')).toBeInTheDocument();
    expect(queryByTestId('quay-tag-page-progress')).toBeNull();
    expect(queryByText(/QuayTagDetails/i)).not.toBeInTheDocument();
  });

  it('should throw error if digest is not defined', () => {
    (useParams as jest.Mock).mockReturnValue({});

    expect(() => render(<QuayTagPage />)).toThrow('digest is not defined');
  });

  it('should show loading if loading is in progress', () => {
    (useParams as jest.Mock).mockReturnValue({ digest: 'digest_data' });
    (useTagDetails as jest.Mock).mockReturnValue({ loading: true });
    const { queryByTestId } = render(<QuayTagPage />);
    expect(queryByTestId('quay-tag-page-progress')).not.toBeNull();
  });

  it('should show error: no digest if value is not there', () => {
    (useParams as jest.Mock).mockReturnValue({ digest: 'digest_data' });
    (useTagDetails as jest.Mock).mockReturnValue({ loading: false });
    const { queryByTestId, queryAllByText } = render(
      <TestApiProvider
        apis={[
          [translationApiRef, mockApis.translation()],
          [errorApiRef, new MockErrorApi()],
        ]}
      >
        <QuayTagPage />
      </TestApiProvider>,
    );
    expect(queryAllByText(/no digest/i)[0]).toBeInTheDocument();
    expect(queryByTestId('quay-tag-page-progress')).toBeNull();
  });

  it('should show QuayTagDetails if value is there', () => {
    (useParams as jest.Mock).mockReturnValue({ digest: 'digest_data' });
    (useTagDetails as jest.Mock).mockReturnValue({
      loading: false,
      value: { data: [{ Features: [] }] },
    });
    const { queryByText } = render(<QuayTagPage />);
    expect(queryByText(/QuayTagDetails/i)).toBeInTheDocument();
  });
});
