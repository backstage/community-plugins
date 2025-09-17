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
import { useContext, createContext, PropsWithChildren, useMemo } from 'react';

export interface SettingsContext {
  tabs: { path: string; title: string }[];
}

const ctx = createContext<SettingsContext>(null as any);

export interface SettingsProviderProps {
  tabs: { path: string; title: string }[];
}

export function SettingsProvider({
  tabs,
  children,
}: PropsWithChildren<SettingsProviderProps>) {
  const value = useMemo(() => ({ tabs }), [tabs]);

  return <ctx.Provider value={value} children={children} />;
}

export function useSettings() {
  const settings = useContext(ctx);
  if (!settings) {
    throw new Error('No settings provider found');
  }

  return settings;
}
