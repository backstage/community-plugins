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
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { AppTheme, appThemeApiRef, useApi } from '@backstage/core-plugin-api';

const THEME_DARK_CLASS = 'pf-v6-theme-dark';
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Whether the app renders a dark theme. Picks the theme the same way the
 * Backstage AppThemeProvider does: the selected theme, else (no selection,
 * i.e. "auto") an installed theme matching the system color scheme.
 */
const isDarkTheme = (
  themeId: string | undefined,
  prefersDark: boolean,
  themes: AppTheme[],
) => {
  const theme =
    themes.find(t => t.id === themeId) ??
    (prefersDark ? themes.find(t => t.variant === 'dark') : undefined) ??
    themes.find(t => t.variant === 'light') ??
    themes[0];
  return theme?.variant === 'dark';
};

const usePrefersDarkColorScheme = () => {
  const mediaQuery = useMemo(
    () =>
      typeof window.matchMedia === 'function'
        ? window.matchMedia(PREFERS_DARK_QUERY)
        : undefined,
    [],
  );
  const [prefersDark, setPrefersDark] = useState(mediaQuery?.matches ?? false);

  useEffect(() => {
    if (!mediaQuery) return undefined;
    const listener = (event: MediaQueryListEvent) =>
      setPrefersDark(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [mediaQuery]);

  return prefersDark;
};

/**
 * Syncs PatternFly dark theme class on the document root with the Backstage theme.
 */
export const useDarkTheme = () => {
  const appThemeApi = useApi(appThemeApiRef);
  const [activeThemeId, setActiveThemeId] = useState(
    appThemeApi.getActiveThemeId(),
  );
  const prefersDark = usePrefersDarkColorScheme();

  useEffect(() => {
    const subscription = appThemeApi.activeThemeId$().subscribe({
      next: themeId => {
        setActiveThemeId(themeId);
      },
    });
    return () => subscription.unsubscribe();
  }, [appThemeApi]);

  const isDark = isDarkTheme(
    activeThemeId,
    prefersDark,
    appThemeApi.getInstalledThemes(),
  );

  useLayoutEffect(() => {
    const htmlTagElement = document.documentElement;
    if (isDark) {
      htmlTagElement.classList.add(THEME_DARK_CLASS);
    } else {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    }

    return () => {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    };
  }, [isDark]);
};
