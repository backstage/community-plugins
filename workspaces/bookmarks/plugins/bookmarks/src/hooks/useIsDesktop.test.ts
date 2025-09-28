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
import { useIsDesktop } from './useIsDesktop';
import { mockBreakpoint } from '@backstage/core-components/testUtils';

describe('useIsDesktop', () => {
  it('should export hook', () => {
    expect(useIsDesktop).toBeDefined();
  });

  it('should return true for desktop viewports', () => {
    mockBreakpoint({ matches: true });
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });

  it('should return false for mobile viewports', () => {
    mockBreakpoint({ matches: false });
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);
  });
});
