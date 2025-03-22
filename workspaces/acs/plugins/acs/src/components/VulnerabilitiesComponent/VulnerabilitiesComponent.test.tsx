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
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VulnerabilitiesComponent } from './VulnerabilitiesComponent';
import { QueryACSData } from '../../common/QueryACSData';

jest.mock('../../common/QueryACSData', () => ({
  QueryACSData: jest.fn(),
}));

describe('VulnerabilitiesComponent', () => {
  test('displays loading state initially', () => {
    (QueryACSData as jest.Mock).mockReturnValue({
      result: null,
      loaded: false,
      error: null,
    });

    render(<VulnerabilitiesComponent deploymentName="Test" />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message when data fetch fails', () => {
    (QueryACSData as jest.Mock).mockReturnValue({
      result: null,
      loaded: true,
      error: new Error('Test error'),
    });

    render(<VulnerabilitiesComponent deploymentName="Test" />);

    expect(
      screen.getByText(/error retrieving data from ACS./i),
    ).toBeInTheDocument();
  });
});
