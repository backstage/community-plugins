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
import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { copilotPlugin, CopilotSidebar, CopilotIndexPage } from '../src';
import {
  UnifiedThemeProvider,
  themes as builtinThemes,
} from '@backstage/theme';
import DarkIcon from '@mui/icons-material/Brightness2';
import LightIcon from '@mui/icons-material/WbSunny';
import { AppTheme } from '@backstage/core-plugin-api';

const customThemes: AppTheme[] = [
  {
    id: 'light',
    title: 'Light Theme',
    variant: 'light',
    icon: <LightIcon />,
    Provider: ({ children }: React.PropsWithChildren) => (
      <UnifiedThemeProvider theme={builtinThemes.light} children={children} />
    ),
  },
  {
    id: 'dark',
    title: 'Dark Theme',
    variant: 'dark',
    icon: <DarkIcon />,
    Provider: ({ children }: React.PropsWithChildren) => (
      <UnifiedThemeProvider theme={builtinThemes.dark} children={children} />
    ),
  },
];

createDevApp()
  .addThemes(customThemes)
  .registerPlugin(copilotPlugin)
  .addSidebarItem(<CopilotSidebar />)
  .addPage({
    element: <CopilotIndexPage />,
    path: '/copilot',
  })
  .render();
