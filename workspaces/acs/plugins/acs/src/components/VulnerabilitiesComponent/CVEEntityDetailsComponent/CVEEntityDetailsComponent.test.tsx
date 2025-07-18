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
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CVEEntityDetailsComponent } from './CVEEntityDetailsComponent';

const mockData = {
  expandedData: {
    cluster: 'test',
    component: 'test',
    cveFixedIn: 'test',
    firstDiscovered: 'test',
    image: 'test',
    location: 'test',
    namespace: 'test',
    published: 'test',
    severity: 'test',
    source: 'test',
    summary: 'test',
    version: 'test',
    workload: 'test',
  },
  rowData: {
    cve: 'test',
    cvss: 'test',
    discovered: 'test',
    image: 'test',
    link: 'test',
    severity: 'test',
    status: 'test',
    workload: 'test',
  },
};

describe('CVEEntityDetailsComponent', () => {
  test('displays the CVEEntityDetailsComponent in the DOM', () => {
    const populateRows = jest.fn();
    (populateRows as jest.Mock).mockReturnValue([]);

    render(
      <CVEEntityDetailsComponent
        data={mockData}
        cveDetails=""
        entityDetails=""
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
