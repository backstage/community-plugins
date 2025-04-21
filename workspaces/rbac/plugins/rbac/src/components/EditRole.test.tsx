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
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';

import { usePermission } from '@backstage/plugin-permission-react';

import { fireEvent, render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';

import EditRole from './EditRole';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('@backstage/catalog-model', () => ({
  ...jest.requireActual('@backstage/catalog-model'),
  parseEntityRef: jest.fn().mockReturnValue({
    name: 'roleName',
    namespace: 'default',
    kind: 'Role',
  }),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
  RequirePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('EditRole', () => {
  const isAllowed = true;

  it('renders the button as disabled when canEdit is true', () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    render(
      <Router>
        <EditRole roleName="roleName" canEdit={isAllowed} />
      </Router>,
    );
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
  });

  it('renders the button with correct tooltip and enabled state', () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    const tooltipText = 'Edit Role Tooltip';
    const dataTestIdText = 'edit-role-btn';
    render(
      <Router>
        <EditRole
          roleName="roleName"
          dataTestId={dataTestIdText}
          canEdit={isAllowed}
          tooltip={tooltipText}
        />
      </Router>,
    );

    expect(screen.getByTestId('edit-role-btn')).toHaveAttribute(
      'aria-label',
      tooltipText,
    );
    expect(screen.getByRole('button', { name: 'Update' })).not.toBeDisabled();
  });

  it('sets the correct navigation path when "to" prop is provided', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    const toPath = '/custom/path';
    render(
      <Router>
        <EditRole roleName="roleName" canEdit={isAllowed} to={toPath} />
      </Router>,
    );

    const button = screen.getByRole('button', { name: /update/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith(toPath);
  });

  it('sets the correct default navigation path based on roleName', () => {
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    render(
      <Router>
        <EditRole roleName="roleName" canEdit={isAllowed} />
      </Router>,
    );
    const button = screen.getByRole('button', { name: /update/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('../role/Role/default/roleName');
  });
});
