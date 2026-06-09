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
import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';
import { renderHook } from '@testing-library/react';

import { useDarkTheme } from './useDarkTheme';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

const useApiMock = useApi as jest.Mock;

const createAppThemeApi = (initialThemeId: string) => {
  let themeId = initialThemeId;
  const listeners = new Set<(id: string) => void>();

  return {
    getActiveThemeId: () => themeId,
    activeThemeId$: () => ({
      subscribe: ({ next }: { next: (value: string) => void }) => {
        next(themeId);
        listeners.add(next);
        return {
          unsubscribe: () => {
            listeners.delete(next);
          },
        };
      },
    }),
    setActiveThemeId: (id: string) => {
      themeId = id;
      listeners.forEach(listener => listener(id));
    },
    getInstalledThemes: () => [],
  };
};

describe('useDarkTheme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('pf-v6-theme-dark');
    useApiMock.mockImplementation(apiRef => {
      if (apiRef === appThemeApiRef) {
        return createAppThemeApi('light');
      }
      throw new Error('Unexpected api ref');
    });
  });

  it('should add dark theme class to html tag', () => {
    useApiMock.mockImplementation(apiRef => {
      if (apiRef === appThemeApiRef) {
        return createAppThemeApi('dark');
      }
      throw new Error('Unexpected api ref');
    });
    renderHook(() => useDarkTheme());
    expect(
      document.documentElement.classList.contains('pf-v6-theme-dark'),
    ).toBe(true);
  });

  it('should remove dark theme class from html tag', () => {
    useApiMock.mockImplementation(apiRef => {
      if (apiRef === appThemeApiRef) {
        return createAppThemeApi('light');
      }
      throw new Error('Unexpected api ref');
    });
    renderHook(() => useDarkTheme());
    expect(
      document.documentElement.classList.contains('pf-v6-theme-dark'),
    ).toBe(false);
  });

  it('should remove dark theme class from html tag on unmount', () => {
    useApiMock.mockImplementation(apiRef => {
      if (apiRef === appThemeApiRef) {
        return createAppThemeApi('dark');
      }
      throw new Error('Unexpected api ref');
    });
    const { unmount } = renderHook(() => useDarkTheme());
    expect(
      document.documentElement.classList.contains('pf-v6-theme-dark'),
    ).toBe(true);
    unmount();
    expect(
      document.documentElement.classList.contains('pf-v6-theme-dark'),
    ).toBe(false);
  });
});
