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

import { renderHook } from '@testing-library/react-hooks';
import { usePermission } from '@backstage/plugin-permission-react';
import { useActionPermissionTooltip } from './useActionPermissionTooltip';

jest.mock('@backstage/plugin-permission-react');

const mockedUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('useActionPermissionTooltip', () => {
  const mockPermission = { name: 'test-permission' };
  const resourceRef = 'role:default/test-role';

  it('returns loading tooltip when permission is loading', () => {
    mockedUsePermission.mockReturnValue({ loading: true, allowed: false });

    const { result } = renderHook(() =>
      useActionPermissionTooltip({
        permission: mockPermission,
        resourceRef,
        canAct: true,
        action: 'edit',
      }),
    );

    expect(result.current.tooltipText).toBe('Checking permissions…');
    expect(result.current.disable).toBe(true);
    expect(result.current.testIdText).toBe(`disable-edit-role-${resourceRef}`);
  });

  it('returns unauthorized tooltip when not allowed or cannot act', () => {
    mockedUsePermission.mockReturnValue({ loading: false, allowed: false });

    const { result } = renderHook(() =>
      useActionPermissionTooltip({
        permission: mockPermission,
        resourceRef,
        canAct: true,
        action: 'edit',
      }),
    );

    expect(result.current.tooltipText).toBe('Unauthorized to edit');
    expect(result.current.disable).toBe(true);
  });

  it('returns correct tooltip when allowed', () => {
    mockedUsePermission.mockReturnValue({ loading: false, allowed: true });

    const { result } = renderHook(() =>
      useActionPermissionTooltip({
        permission: mockPermission,
        resourceRef,
        canAct: true,
        action: 'delete',
      }),
    );

    expect(result.current.tooltipText).toBe('Delete role');
    expect(result.current.disable).toBe(false);
    expect(result.current.testIdText).toBe(`delete-role-${resourceRef}`);
  });

  it('uses fallbackTooltip if provided', () => {
    mockedUsePermission.mockReturnValue({ loading: false, allowed: true });

    const { result } = renderHook(() =>
      useActionPermissionTooltip({
        permission: mockPermission,
        resourceRef,
        canAct: true,
        action: 'edit',
        fallbackTooltip: 'Custom tooltip!',
      }),
    );

    expect(result.current.tooltipText).toBe('Custom tooltip!');
  });

  it('uses custom dataTestId if provided', () => {
    mockedUsePermission.mockReturnValue({ loading: false, allowed: true });

    const { result } = renderHook(() =>
      useActionPermissionTooltip({
        permission: mockPermission,
        resourceRef,
        canAct: true,
        action: 'edit',
        dataTestId: 'custom-id',
      }),
    );

    expect(result.current.testIdText).toBe('custom-id');
  });
});
