/*
 * Copyright 2025 The Backstage Authors
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
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ACSComponent } from './ACSComponent';
import { mockApis, TestApiProvider } from '@backstage/frontend-test-utils';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: jest.fn().mockReturnValue({
    metadata: {
      annotations: { 'acs/deployment-name': 'test-deployment-name' },
    },
  }),
}));

describe('DataFilterComponent', () => {
  test('displays loading state initially', async () => {
    const mockConfigApi = mockApis.config({
      data: {
        acs: {
          acsUrl: 'http://localhost:3000',
        },
      },
    });

    render(
      <TestApiProvider
        apis={[mockConfigApi, mockApis.error(), mockApis.translation()]}
      >
        <ACSComponent />
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Assess vulnerabilities for your component workloads'),
      ).toBeInTheDocument();
    });
  });
});
