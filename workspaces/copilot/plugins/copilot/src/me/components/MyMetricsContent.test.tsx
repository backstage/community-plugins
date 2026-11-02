/*
 * Copyright 2026 The Backstage Authors
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

import { render, screen } from '@testing-library/react';
import { MyMetricsContent } from './MyMetricsContent';

jest.mock('@backstage/frontend-plugin-api', () => ({
  configApiRef: {},
  identityApiRef: {},
  useApi: jest.fn(ref =>
    ref === undefined
      ? undefined
      : {
          getOptionalBoolean: jest.fn().mockReturnValue(true),
          getOptionalString: jest.fn().mockReturnValue(undefined),
          getProfileInfo: jest.fn(),
        },
  ),
}));

jest.mock('react-use', () => ({
  useAsync: jest.fn().mockReturnValue({ value: undefined }),
}));

jest.mock('@backstage/ui', () => ({
  Alert: ({ title }: { title: string }) => <div>{title}</div>,
  Container: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Header: ({ title }: { title: string }) => <h1>{title}</h1>,
  HeaderMetadataUsers: () => null,
}));

jest.mock('@backstage/core-components', () => ({
  InfoCard: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Progress: () => <div>Loading</div>,
}));

jest.mock('../hooks', () => ({
  useMyDashboardData: jest.fn().mockReturnValue({
    data: undefined,
    loading: false,
    error: undefined,
  }),
}));

describe('MyMetricsContent', () => {
  it('renders the header when no metrics entity has been configured', () => {
    render(<MyMetricsContent />);

    expect(
      screen.getByRole('heading', { name: 'My Copilot Metrics' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Configure either copilot.enterprise or copilot.organization to use the Copilot Insights dashboard.',
      ),
    ).toBeInTheDocument();
  });
});
