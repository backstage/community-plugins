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
import { useTheme } from '@material-ui/core/styles';
import { renderHook } from '@testing-library/react';

import { useDarkTheme } from './useDarkTheme';

jest.mock('@material-ui/core/styles', () => ({
  useTheme: jest.fn(),
}));

const useThemeMock = useTheme as jest.Mock;

describe('useDarkTheme', () => {
  it('should add dark theme class to html tag', () => {
    useThemeMock.mockReturnValue({
      palette: {
        type: 'dark',
      },
    });
    renderHook(() => useDarkTheme());
    const htmlTagElement = document.documentElement;
    expect(htmlTagElement.classList.contains('pf-v5-theme-dark')).toBe(true);
  });

  it('should remove dark theme class from html tag', () => {
    useThemeMock.mockReturnValue({
      palette: {
        type: 'light',
      },
    });
    renderHook(() => useDarkTheme());
    const htmlTagElement = document.documentElement;
    expect(htmlTagElement.classList.contains('pf-v5-theme-dark')).toBe(false);
  });
});
