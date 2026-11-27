/*
 * Copyright 2023 The Backstage Authors
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

import { openCostPlugin } from './plugin';
import openCostFrontendPlugin from './alpha';
import { renderTestApp } from '@backstage/frontend-test-utils';
import { screen, within } from '@testing-library/react';

jest.mock('./components/OpenCostReport', () => ({
  OpenCostReport: () => 'OpenCost report',
}));

describe('opencost', () => {
  it('should export plugin', () => {
    expect(openCostPlugin).toBeDefined();
  });

  it('should render the OpenCost page in the new frontend system', async () => {
    renderTestApp({
      features: [openCostFrontendPlugin],
      initialRouteEntries: ['/opencost'],
    });

    expect(await screen.findByText('OpenCost report')).toBeTruthy();
    expect(screen.getAllByRole('heading', { name: 'OpenCost' })).toHaveLength(
      1,
    );
    expect(
      within(screen.getByTestId('sidebar-root'))
        .getByRole('link', { name: 'OpenCost' })
        .getAttribute('href'),
    ).toBe('/opencost');
  });
});
