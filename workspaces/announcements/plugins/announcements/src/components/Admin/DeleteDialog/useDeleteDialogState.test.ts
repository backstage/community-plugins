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
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useDeleteDialogState } from './useDeleteDialogState';

describe('useDeleteDialogState', () => {
  it('should return initial state with isOpen false and no item', () => {
    const { result } = renderHook(() => useDeleteDialogState<string>());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.item).toBeUndefined();
    expect(typeof result.current.open).toBe('function');
    expect(typeof result.current.close).toBe('function');
  });

  it('should open dialog with item when open is called', () => {
    const { result } = renderHook(() => useDeleteDialogState<string>());

    act(() => {
      result.current.open('test-item');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.item).toBe('test-item');
  });

  it('should close dialog and clear item when close is called', () => {
    const { result } = renderHook(() => useDeleteDialogState<string>());

    act(() => {
      result.current.open('test-item');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.item).toBe('test-item');

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.item).toBeUndefined();
  });

  it('should update item when open is called multiple times', () => {
    const { result } = renderHook(() => useDeleteDialogState<string>());

    act(() => {
      result.current.open('first-item');
    });

    expect(result.current.item).toBe('first-item');

    act(() => {
      result.current.open('second-item');
    });

    expect(result.current.item).toBe('second-item');
    expect(result.current.isOpen).toBe(true);
  });

  it('should work with object types', () => {
    type TestItem = { id: string; name: string };
    const { result } = renderHook(() => useDeleteDialogState<TestItem>());

    const testItem: TestItem = { id: '1', name: 'Test' };

    act(() => {
      result.current.open(testItem);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.item).toEqual(testItem);
    expect(result.current.item?.id).toBe('1');
    expect(result.current.item?.name).toBe('Test');
  });

  it('should work with number types', () => {
    const { result } = renderHook(() => useDeleteDialogState<number>());

    act(() => {
      result.current.open(42);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.item).toBe(42);
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() =>
      useDeleteDialogState<string>(),
    );

    const initialOpen = result.current.open;
    const initialClose = result.current.close;

    rerender();

    expect(result.current.open).toBe(initialOpen);
    expect(result.current.close).toBe(initialClose);
  });

  it('should handle rapid open/close calls', () => {
    const { result } = renderHook(() => useDeleteDialogState<string>());

    act(() => {
      result.current.open('item-1');
      result.current.close();
      result.current.open('item-2');
      result.current.close();
      result.current.open('item-3');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.item).toBe('item-3');
  });
});
