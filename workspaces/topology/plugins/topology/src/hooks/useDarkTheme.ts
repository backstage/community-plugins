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
import { useEffect, useLayoutEffect, useState } from 'react';

import { appThemeApiRef, useApi } from '@backstage/core-plugin-api';

const THEME_DARK = 'dark';
const THEME_DARK_CLASS = 'pf-v6-theme-dark';

/**
 * Syncs PatternFly dark theme class on the document root with the Backstage theme.
 */
export const useDarkTheme = () => {
  const appThemeApi = useApi(appThemeApiRef);
  const [activeThemeId, setActiveThemeId] = useState(
    appThemeApi.getActiveThemeId(),
  );

  useEffect(() => {
    const subscription = appThemeApi.activeThemeId$().subscribe({
      next: themeId => {
        setActiveThemeId(themeId);
      },
    });
    return () => subscription.unsubscribe();
  }, [appThemeApi]);

  const isDark = activeThemeId === THEME_DARK;

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
