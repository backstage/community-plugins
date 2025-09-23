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
import { useAsync } from 'react-use';

import { Content, Header, Page } from '@backstage/core-components';

import { render, screen } from '@testing-library/react';

import { mockMembers } from '../../__fixtures__/mockMembers';
import { CreateRolePage } from './CreateRolePage';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('react-use', () => ({
  useAsync: jest.fn(),
}));

jest.mock('./RoleForm', () => ({
  RoleForm: () => <div>RoleForm</div>,
}));

jest.mock('@backstage/core-components', () => ({
  Page: jest.fn().mockImplementation(({ children }) => (
    <div data-testid="mockPage">
      Create Role Page
      {children}
    </div>
  )),
  Header: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
  Content: jest
    .fn()
    .mockImplementation(({ children }) => <div>{children}</div>),
}));
const mockedPage = Page as jest.MockedFunction<typeof Page>;
const mockedHeader = Header as jest.MockedFunction<typeof Header>;
const mockedContent = Content as jest.MockedFunction<typeof Content>;

const useAsyncMock = useAsync as jest.MockedFunction<typeof useAsync>;

beforeEach(() => {
  jest.mock('@backstage/core-plugin-api', () => ({
    ...jest.requireActual('@backstage/core-plugin-api'),
    useApi: jest.fn().mockReturnValue({
      getMembers: jest.fn().mockReturnValue(mockMembers),
    }),
  }));
});

describe('CreateRolePage', () => {
  it('renders the RoleForm component', async () => {
    useAsyncMock.mockReturnValueOnce({
      loading: false,
      value: mockMembers,
    });

    render(<CreateRolePage />);
    expect(mockedPage).toHaveBeenCalled();
    expect(mockedHeader).toHaveBeenCalled();
    expect(mockedContent).toHaveBeenCalled();
    expect(screen.queryByText('Create Role Page')).toBeInTheDocument();
    expect(screen.queryByText('RoleForm')).toBeInTheDocument();
  });
});
