/*
 * Copyright 2026 The Backstage Authors
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
import { useElapsedMs } from './useElapsedMs';

describe('useElapsedMs', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('counts while active and resets when inactive or the key changes', () => {
    const { result, rerender } = renderHook(
      (props: { active: boolean; key: string }) =>
        useElapsedMs(props.active, props.key),
      { initialProps: { active: true, key: 'a' } },
    );
    expect(result.current).toBe(0);
    act(() => jest.advanceTimersByTime(350));
    expect(result.current).toBeGreaterThanOrEqual(300);

    rerender({ active: true, key: 'b' });
    expect(result.current).toBe(0);
    act(() => jest.advanceTimersByTime(150));
    expect(result.current).toBeGreaterThanOrEqual(100);

    rerender({ active: false, key: 'b' });
    expect(result.current).toBe(0);
    act(() => jest.advanceTimersByTime(500));
    expect(result.current).toBe(0);
  });
});
