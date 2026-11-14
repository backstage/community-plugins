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
import { useBreakpoint } from '@backstage/ui';
import { useIsDesktop } from './useIsDesktop';

jest.mock('@backstage/ui', () => ({
  ...jest.requireActual('@backstage/ui'),
  useBreakpoint: jest.fn(),
}));

const mockUseBreakpoint = useBreakpoint as jest.Mock;

describe('useIsDesktop', () => {
  it('should export hook', () => {
    expect(useIsDesktop).toBeDefined();
  });

  it('should return true for desktop viewports', () => {
    const up = jest.fn().mockReturnValue(true);
    mockUseBreakpoint.mockReturnValue({ breakpoint: 'md', up });
    const { result } = renderHook(() => useIsDesktop());
    expect(up).toHaveBeenCalledWith('md');
    expect(result.current).toBe(true);
  });

  it('should return false for mobile viewports', () => {
    const up = jest.fn().mockReturnValue(false);
    mockUseBreakpoint.mockReturnValue({ breakpoint: 'xs', up });
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);
  });
});
