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
 * Stable form configuration shared across all patches and sections.
 * Created once at the layout level, never changes between renders.
 */

import { createContext, useContext } from 'react';
import { customizeValidator } from '@rjsf/validator-ajv8';
import { PatchDefinition } from '@backstage-community/plugin-entity-patch-common';

export interface FormConfig {
  validator: ReturnType<typeof customizeValidator>;
  fields: Record<string, any>;
  validate: (
    patch: PatchDefinition,
    data: unknown,
  ) => Promise<Record<string, unknown>>;
}

const FormConfigContext = createContext<FormConfig | null>(null);
export const FormConfigProvider = FormConfigContext.Provider;

export function useFormConfig(): FormConfig {
  const ctx = useContext(FormConfigContext);
  if (!ctx)
    throw new Error('useFormConfig must be used within FormConfigProvider');
  return ctx;
}
