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

import {
  ExtensionInput,
  ResolvedExtensionInputs,
} from '@backstage/frontend-plugin-api';

import { manageConfigDataRef } from '../extensions';
import { ManageDynamicConfig } from './types';

/**
 * This is an internal utility function
 *
 * @public
 */
export function parseDynamicConfig(
  configs: ResolvedExtensionInputs<{
    config: ExtensionInput<
      typeof manageConfigDataRef,
      {
        optional: false;
        singleton: boolean;
      }
    >;
  }>['config'],
) {
  return configs.reduce(
    (prev, cur) => {
      const cfg = cur.get(manageConfigDataRef);
      const userSettings = cfg.primeUserSettings ?? [];
      return {
        primeUserSettings: [...prev.primeUserSettings, ...userSettings],
      };
    },
    { primeUserSettings: [] } as ManageDynamicConfig,
  );
}
