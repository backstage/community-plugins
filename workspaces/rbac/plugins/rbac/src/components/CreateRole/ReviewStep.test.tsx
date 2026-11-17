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
    render(
      <ReviewStep
        values={mockValues}
        initialValues={mockValues}
        isEditing={false}
      />,
    );
    expect(screen.getByText('Review and create')).toBeInTheDocument();
  });

  it('renders "Review and save" for editing existing roles', () => {
    render(
      <ReviewStep values={mockValues} initialValues={mockValues} isEditing />,
    );
    expect(screen.getByText('Review and save')).toBeInTheDocument();
  });

  it('passes the correct metadata to StructuredMetadataTable', () => {
    render(
      <ReviewStep
        values={mockValues}
        initialValues={mockValues}
        isEditing={false}
      />,
    );

    expect(screen.getByText('Users and groups (1 user)')).toBeInTheDocument();
    expect(screen.getByText('Permission policies (1)')).toBeInTheDocument();
    expect(screen.getByText(mockValues.name)).toBeInTheDocument();
    expect(screen.getByText(mockValues.description)).toBeInTheDocument();
  });

  it('does not show a changes summary when creating a role', () => {
    render(
      <ReviewStep
        values={mockValues}
        initialValues={{
          ...mockValues,
          name: '',
          selectedMembers: [],
          permissionPoliciesRows: [],
        }}
        isEditing={false}
      />,
    );

    expect(screen.queryByText('Changes to this role')).not.toBeInTheDocument();
  });

  it('states that nothing changed when editing without changes', () => {
    render(
      <ReviewStep values={mockValues} initialValues={mockValues} isEditing />,
    );

    expect(screen.getByText('Changes to this role')).toBeInTheDocument();
    expect(
      screen.getByText('No changes have been made to this role.'),
    ).toBeInTheDocument();
  });

  it('lists added, removed and changed items when editing a role', () => {
    const values = {
      ...mockValues,
      description: 'New Description',
      selectedMembers: [
        { label: 'Group 1', etag: 'etag2', type: 'Group', ref: 'Group One' },
      ],
      permissionPoliciesRows: [
        {
          plugin: 'policy1',
          permission: 'permission2',
          policies: [{ policy: 'Update', effect: 'allow' }],
        },
      ],
    };

    render(<ReviewStep values={values} initialValues={mockValues} isEditing />);

    expect(
      screen.queryByText('No changes have been made to this role.'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Description: from "Test Description" to "New Description"',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Group 1 (Group)')).toBeInTheDocument();
    expect(screen.getByText('User 1 (User)')).toBeInTheDocument();
    expect(screen.getByText('permission2: update (allow)')).toBeInTheDocument();
    expect(
      screen.getByText('permission1: policy1 (allow)'),
    ).toBeInTheDocument();

    // Change types are announced as text, not conveyed by color alone.
    expect(screen.getAllByText('Added')).toHaveLength(2);
    expect(screen.getAllByText('Removed')).toHaveLength(2);
    expect(screen.getByText('Changed')).toBeInTheDocument();

    const userItem = screen.getByText('User 1 (User)').closest('li');
    expect(userItem).toHaveTextContent('Removed');
    const groupItem = screen.getByText('Group 1 (Group)').closest('li');
    expect(groupItem).toHaveTextContent('Added');
  });

  it('lists added, removed and changed conditional policies when editing a role', () => {
    const conditionalRow = (id: number | undefined, label: string) => ({
      id,
      plugin: 'catalog',
      permission: 'catalog.entity.delete',
      resourceType: 'catalog-entity',
      isResourced: true,
      policies: [{ policy: 'Delete', effect: 'allow' }],
      conditions: {
        condition: {
          rule: 'HAS_LABEL',
          resourceType: 'catalog-entity',
          params: { label },
        },
      },
    });
    const initialValues = {
      ...mockValues,
      permissionPoliciesRows: [
        conditionalRow(1, 'keep'),
        conditionalRow(2, 'remove-me'),
      ],
    };
    const values = {
      ...mockValues,
      permissionPoliciesRows: [
        conditionalRow(1, 'edited'),
        conditionalRow(undefined, 'brand-new'),
      ],
    };

    render(
      <ReviewStep values={values} initialValues={initialValues} isEditing />,
    );

    expect(screen.getByText('Conditional access policies')).toBeInTheDocument();
    // The new condition, the removed one and the edited one all render with
    // the same "plugin: permission (actions)" format.
    expect(
      screen.getAllByText('catalog: catalog.entity.delete (delete)'),
    ).toHaveLength(3);
    expect(screen.getByText('Added')).toBeInTheDocument();
    expect(screen.getByText('Removed')).toBeInTheDocument();
    expect(screen.getByText('Changed')).toBeInTheDocument();
  });
});
