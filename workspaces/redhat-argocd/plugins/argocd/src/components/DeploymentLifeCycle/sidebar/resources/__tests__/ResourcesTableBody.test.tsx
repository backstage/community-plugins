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
import { render, screen } from '@testing-library/react';

import { ResourcesTableBody } from '../ResourcesTableBody';
import { ResourcesTableRow } from '../ResourcesTableRow';

jest.mock('../ResourcesTableRow', () => ({
  ResourcesTableRow: jest.fn(() => <div>Mocked ResourcesTableRow</div>),
}));

describe('ResourcesTableBody Component', () => {
  const defaultProps = {
    rows: [
      {
        version: 'v1',
        kind: 'Development',
        namespace: 'openshift-gitops',
        name: 'quarkus-app',
        status: 'Synced',
        health: { status: 'Healthy' },
        createTimestamp: '2024-08-25T12:00:00Z',
      },
      {
        version: 'v1',
        kind: 'Service',
        namespace: 'openshift-gitops',
        name: 'quarkus-app',
        status: 'Synced',
        health: { status: 'Healthy' },
        createTimestamp: '2024-08-25T12:00:00Z',
      },
    ],
  };

  it('should render the correct number of ResourcesTableRow components', () => {
    render(<ResourcesTableBody {...defaultProps} />);

    // Check that the correct number of ResourcesTableRow components are rendered
    expect(screen.getAllByText('Mocked ResourcesTableRow')).toHaveLength(2);
  });

  it('should pass the correct props to ResourcesTableRow', () => {
    render(<ResourcesTableBody {...defaultProps} />);

    defaultProps.rows.forEach((row, index) => {
      expect(ResourcesTableRow).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({
          row,
          uid: index.toString(),
        }),
        expect.anything(),
      );
    });
  });
});
