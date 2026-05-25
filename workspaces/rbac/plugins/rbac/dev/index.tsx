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

/**
 * Legacy dev mode for the RBAC plugin.
 */
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';
import { PropsWithChildren } from 'react';
import Brightness2 from '@mui/icons-material/Brightness2';
import WbSunny from '@mui/icons-material/WbSunny';

import { AppTheme } from '@backstage/core-plugin-api';
import {
  UnifiedThemeProvider,
  themes as builtinThemes,
} from '@backstage/theme';
import { createDevApp } from '@backstage/dev-utils';

import { RbacPage, rbacPlugin } from '../src/plugin';
import { rbacTranslations } from '../src/alpha/translations';

const devAppThemes: AppTheme[] = [
  {
    id: 'light',
    title: 'Light',
    variant: 'light',
    icon: <WbSunny />,
    Provider: ({ children }: PropsWithChildren) => (
      <UnifiedThemeProvider theme={builtinThemes.light}>
        {children}
      </UnifiedThemeProvider>
    ),
  },
  {
    id: 'dark',
    title: 'Dark',
    variant: 'dark',
    icon: <Brightness2 />,
    Provider: ({ children }: PropsWithChildren) => (
      <UnifiedThemeProvider theme={builtinThemes.dark}>
        {children}
      </UnifiedThemeProvider>
    ),
  },
];

createDevApp()
  .addThemes(devAppThemes)
  .registerPlugin(rbacPlugin)
  .addTranslationResource(rbacTranslations)
  .setAvailableLanguages(['en', 'de', 'fr', 'it', 'es', 'ja'])
  .setDefaultLanguage('en')
  .addPage({
    element: <RbacPage />,
    title: 'RBAC',
    path: '/rbac',
  })
  .render();
