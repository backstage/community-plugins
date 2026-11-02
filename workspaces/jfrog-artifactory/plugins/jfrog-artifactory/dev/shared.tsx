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

import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import {
  type AppLanguageApi,
  type ExtensionDefinition,
} from '@backstage/frontend-plugin-api';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import {
  SidebarLanguageSwitcher,
  SidebarSignOutButton,
} from '@backstage/dev-utils';

const DEV_LANGUAGES = ['en', 'de', 'fr', 'it', 'es', 'ja'];

export function createDevAppLanguageApi(): AppLanguageApi {
  let language = 'en';
  const listeners = new Set<(value: { language: string }) => void>();

  return {
    getAvailableLanguages: () => ({ languages: [...DEV_LANGUAGES] }),
    getLanguage: () => ({ language }),
    setLanguage: next => {
      language = next ?? 'en';
      const value = { language };
      for (const listener of listeners) {
        listener(value);
      }
    },
    language$: () => {
      const observable = {
        subscribe(
          observer?:
            | ((value: { language: string }) => void)
            | { next?: (value: { language: string }) => void },
        ) {
          const listener =
            typeof observer === 'function'
              ? observer
              : (value: { language: string }) => observer?.next?.(value);
          listeners.add(listener);
          listener({ language });
          let closed = false;
          return {
            get closed() {
              return closed;
            },
            unsubscribe() {
              closed = true;
              listeners.delete(listener);
            },
          };
        },
        [Symbol.observable]() {
          return observable;
        },
      };
      return observable;
    },
  } as AppLanguageApi;
}

export const devSidebarContent: ExtensionDefinition = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      const nav = navItems.withComponent(item => (
        <SidebarItem icon={() => item.icon} to={item.href} text={item.title} />
      ));
      return (
        <Sidebar>
          <SidebarGroup label="Menu">
            <SidebarScrollWrapper>
              {nav.take('page:catalog')}
            </SidebarScrollWrapper>
          </SidebarGroup>
          <SidebarSpace />
          <SidebarLanguageSwitcher />
          <SidebarSignOutButton />
        </Sidebar>
      );
    },
  },
});
