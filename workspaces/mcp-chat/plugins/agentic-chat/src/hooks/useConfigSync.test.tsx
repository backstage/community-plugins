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
import { renderHook } from '@testing-library/react';
import { useConfigSync } from './useConfigSync';

describe('useConfigSync', () => {
  it('does not call apply while loading', () => {
    const apply = jest.fn();
    renderHook(() => useConfigSync(true, 'value', apply));
    expect(apply).not.toHaveBeenCalled();
  });

  it('calls apply once when loading finishes with a value', () => {
    const apply = jest.fn();
    const { rerender } = renderHook(
      ({ loading, value }) => useConfigSync(loading, value, apply),
      { initialProps: { loading: true, value: 'data' as string | null } },
    );

    expect(apply).not.toHaveBeenCalled();

    rerender({ loading: false, value: 'data' });
    expect(apply).toHaveBeenCalledWith('data');
    expect(apply).toHaveBeenCalledTimes(1);

    rerender({ loading: false, value: 'data' });
    expect(apply).toHaveBeenCalledTimes(1);
  });

  it('does not call apply when value is null', () => {
    const apply = jest.fn();
    renderHook(() => useConfigSync(false, null, apply));
    expect(apply).not.toHaveBeenCalled();
  });

  it('does not call apply when value is undefined', () => {
    const apply = jest.fn();
    renderHook(() => useConfigSync(false, undefined, apply));
    expect(apply).not.toHaveBeenCalled();
  });
});
