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
import { useLocation, useNavigate } from 'react-router-dom';

import { renderHook } from '@testing-library/react-hooks';

import { useLocationToast } from './useLocationToast';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

describe('useLocationToast', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('sets toast message based on location state and clears it from history', () => {
    const mockSetToastMessage = jest.fn();

    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/rbac',
      search: '',
      hash: '',
      state: { toastMessage: 'Success Message' },
    });

    renderHook(() => useLocationToast(mockSetToastMessage));

    expect(mockSetToastMessage).toHaveBeenCalledWith('Success Message');
    expect(mockNavigate).toHaveBeenCalledWith('/rbac', {
      replace: true,
      state: { toastMessage: undefined },
    });
  });

  it('cleans up by setting toast message to an empty string', () => {
    const mockSetToastMessage = jest.fn();

    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/rbac',
      search: '',
      hash: '',
      state: { toastMessage: 'Success Message' },
    });

    const { unmount } = renderHook(() => useLocationToast(mockSetToastMessage));
    unmount();

    expect(mockSetToastMessage).toHaveBeenCalledWith('');
  });

  it('does nothing when location state has no toast message', () => {
    const mockSetToastMessage = jest.fn();

    (useLocation as jest.Mock).mockReturnValue({
      pathname: '/rbac',
      search: '',
      hash: '',
      state: {},
    });

    renderHook(() => useLocationToast(mockSetToastMessage));

    expect(mockSetToastMessage).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
