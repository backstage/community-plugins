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
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import EditRole from './EditRole';

jest.mock('@backstage/catalog-model', () => ({
  ...jest.requireActual('@backstage/catalog-model'),
  parseEntityRef: jest.fn().mockReturnValue({
    name: 'roleName',
    namespace: 'default',
    kind: 'Role',
  }),
}));

describe('EditRole', () => {
  it('renders the button as disabled when disable is true', () => {
    render(
      <Router>
        <EditRole roleName="roleName" disable dataTestId="edit-role-btn" />
      </Router>,
    );

    expect(screen.getByRole('link', { name: 'Update' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('renders the button with correct tooltip and enabled state', () => {
    const tooltipText = 'Edit Role Tooltip';
    render(
      <Router>
        <EditRole
          roleName="roleName"
          disable={false}
          dataTestId="edit-role-btn"
          tooltip={tooltipText}
        />
      </Router>,
    );

    expect(screen.getByTestId('edit-role-btn')).toHaveAttribute(
      'aria-label',
      tooltipText,
    );
    expect(screen.getByRole('link', { name: 'Update' })).not.toHaveAttribute(
      'aria-disabled',
    );
  });

  it('sets the correct link path when "to" prop is provided', () => {
    const toPath = '/custom/path';
    render(
      <Router>
        <EditRole
          roleName="roleName"
          disable={false}
          dataTestId="edit-role-btn"
          to={toPath}
        />
      </Router>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', toPath);
  });

  it('sets the correct default link path based on roleName', () => {
    render(
      <Router>
        <EditRole
          roleName="roleName"
          disable={false}
          dataTestId="edit-role-btn"
        />
      </Router>,
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      expect.stringContaining('/role/Role/default/roleName'),
    );
  });
});
