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
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ACSComponent } from './ACSComponent';
import { configApiRef } from '@backstage/core-plugin-api';
import {
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { waitFor } from '@testing-library/react';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  retrieveEntityDeploymentName: jest.fn().mockReturnValue({
    metadata: {
      annotations: { 'acs/deployment-name': 'test-deployment-name' },
    },
  }),
}));

describe('DataFilterComponent', () => {
  test('displays loading state initially', async () => {
    const mockConfigApi = {
      getString: (key: string) => {
        if (key === 'acs.acsUrl') {
          return 'http://localhost:3000';
        }
        throw new Error(`Missing required config value at '${key}'`);
      },
    };

    renderInTestApp(
      <TestApiProvider apis={[[configApiRef, mockConfigApi]]}>
        render(
        <ACSComponent />
        );
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('inScope')).toBeInTheDocument();
    });
  });
});
