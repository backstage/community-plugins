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
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast', () => {
  it('starts in closed state', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toast.open).toBe(false);
    expect(result.current.toast.message).toBe('');
  });

  it('showToast opens with message and default severity', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Saved successfully');
    });

    expect(result.current.toast).toEqual({
      open: true,
      message: 'Saved successfully',
      severity: 'success',
    });
  });

  it('showToast supports custom severity', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Something failed', 'error');
    });

    expect(result.current.toast.severity).toBe('error');
    expect(result.current.toast.open).toBe(true);
  });

  it('closeToast sets open to false while preserving message', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Hello');
    });
    act(() => {
      result.current.closeToast();
    });

    expect(result.current.toast.open).toBe(false);
    expect(result.current.toast.message).toBe('Hello');
  });
});
