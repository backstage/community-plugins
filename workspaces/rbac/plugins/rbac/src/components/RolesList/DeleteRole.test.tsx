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

import * as DeleteDialogContext from '@janus-idp/shared-react';
import { fireEvent, render, screen } from '@testing-library/react';

import DeleteRole from './DeleteRole';

jest.mock('@janus-idp/shared-react', () => ({
  useDeleteDialog: jest.fn().mockReturnValue({
    deleteComponent: '',
    setDeleteComponent: jest.fn(),
    openDialog: false,
    setOpenDialog: jest.fn(),
  }),
}));
describe('DeleteRole', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the button with the correct tooltip', () => {
    render(
      <DeleteRole
        roleName="Admin"
        disable={false}
        tooltip="Delete Admin Role"
        dataTestId="delete-admin-role"
      />,
    );

    expect(screen.getByTestId('delete-admin-role')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'title',
      'Delete Admin Role',
    );
  });

  it('calls openDialog with the roleName when clicked', () => {
    render(
      <DeleteRole
        roleName="Admin"
        disable={false}
        dataTestId="delete-admin-role"
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    const { setDeleteComponent, setOpenDialog } =
      DeleteDialogContext.useDeleteDialog();
    expect(setDeleteComponent).toHaveBeenCalledWith({ roleName: 'Admin' });
    expect(setOpenDialog).toHaveBeenCalledWith(true);
  });

  it('disables the button when disable prop is true', () => {
    render(
      <DeleteRole roleName="Admin" disable dataTestId="delete-admin-role" />,
    );

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
