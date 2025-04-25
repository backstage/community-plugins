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

import { ReviewStep } from './ReviewStep';

import '@testing-library/jest-dom';

describe('ReviewStep', () => {
  const mockValues = {
    name: 'Test Role',
    kind: 'user',
    namespace: 'testns',
    description: 'Test Description',
    selectedMembers: [
      { label: 'User 1', etag: 'etag1', type: 'User', ref: 'User One' },
    ],
    selectedPlugins: [{ label: 'Policy1', value: 'policy1' }],
    permissionPoliciesRows: [
      {
        plugin: 'policy1',
        permission: 'permission1',
        policies: [{ policy: 'policy1', effect: 'allow' }],
      },
    ],
  };

  it('renders "Review and create" for new roles', () => {
    render(<ReviewStep values={mockValues} isEditing={false} />);
    expect(screen.getByText('Review and create')).toBeInTheDocument();
  });

  it('renders "Review and save" for editing existing roles', () => {
    render(<ReviewStep values={mockValues} isEditing />);
    expect(screen.getByText('Review and save')).toBeInTheDocument();
  });

  it('passes the correct metadata to StructuredMetadataTable', () => {
    render(<ReviewStep values={mockValues} isEditing={false} />);

    expect(screen.getByText('Users and groups (1 user)')).toBeInTheDocument();
    expect(screen.getByText('Permission policies (1)')).toBeInTheDocument();
    expect(screen.getByText(mockValues.name)).toBeInTheDocument();
    expect(screen.getByText(mockValues.description)).toBeInTheDocument();
  });
});
