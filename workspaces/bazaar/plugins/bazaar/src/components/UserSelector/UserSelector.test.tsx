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
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { UserSelector } from './UserSelector';
import { useForm, FormProvider } from 'react-hook-form';
import { Entity } from '@backstage/catalog-model';

const mockUsers: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: 'john.doe',
      namespace: 'default',
    },
    spec: {
      profile: {
        displayName: 'John Doe',
        email: 'john@example.com',
      },
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: 'jane.smith',
      namespace: 'default',
    },
    spec: {
      profile: {
        displayName: 'Jane Smith',
        email: 'jane@example.com',
      },
    },
  },
];

const mockOnSubmit = jest.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();

  const onSubmit = (data: any) => {
    mockOnSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
};

describe('UserSelector', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly, allows filtering, selecting a user, and submits the form', async () => {
    render(
      <TestWrapper>
        <UserSelector
          users={mockUsers}
          disableClearable={false}
          defaultValue={null}
          label="Select User"
          name="responsible"
          control={undefined as any}
        />
      </TestWrapper>,
    );

    await act(async () => {
      const input = screen.getByLabelText('Select User');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'john' } });

      await waitFor(() => {
        expect(screen.getByText('john.doe')).toBeInTheDocument();
        expect(screen.queryByText('jane.smith')).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('john.doe'));
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        responsible: 'user:default/john.doe',
      });
    });
  });

  it('allows the user to manually input a name and submits the form', async () => {
    render(
      <TestWrapper>
        <UserSelector
          users={mockUsers}
          disableClearable={false}
          defaultValue={null}
          label="Select User"
          name="responsible"
          control={undefined as any}
        />
      </TestWrapper>,
    );

    await act(async () => {
      const input = screen.getByLabelText('Select User');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'custom.user' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        responsible: 'custom.user',
      });
    });
  });
});
