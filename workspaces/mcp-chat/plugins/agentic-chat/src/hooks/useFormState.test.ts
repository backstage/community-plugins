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
import { useFormState } from './useFormState';

interface TestForm extends Record<string, unknown> {
  name: string;
  count: number;
}

describe('useFormState', () => {
  const initial: TestForm = { name: '', count: 0 };

  it('initializes with provided values', () => {
    const { result } = renderHook(() => useFormState(initial));
    expect(result.current.values).toEqual(initial);
    expect(result.current.dirty).toBe(false);
  });

  it('setField updates a single field and marks dirty', () => {
    const { result } = renderHook(() => useFormState(initial));

    act(() => {
      result.current.setField('name', 'Alice');
    });

    expect(result.current.values.name).toBe('Alice');
    expect(result.current.values.count).toBe(0);
    expect(result.current.dirty).toBe(true);
  });

  it('setValues replaces all values and resets dirty baseline', () => {
    const { result } = renderHook(() => useFormState(initial));

    act(() => {
      result.current.setValues({ name: 'Bob', count: 5 });
    });

    expect(result.current.values).toEqual({ name: 'Bob', count: 5 });
    expect(result.current.dirty).toBe(false);
  });

  it('resetDirty marks current values as clean', () => {
    const { result } = renderHook(() => useFormState(initial));

    act(() => {
      result.current.setField('count', 42);
    });
    expect(result.current.dirty).toBe(true);

    act(() => {
      result.current.resetDirty();
    });
    expect(result.current.dirty).toBe(false);
  });
});
