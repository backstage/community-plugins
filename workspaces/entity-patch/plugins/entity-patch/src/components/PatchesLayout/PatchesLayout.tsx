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
 * PatchesLayout
 *
 * Creates the shared FormConfig, then renders one PatchForm per patch.
 * A single ref aggregates patch data/validity across all patches so sibling
 * PatchForms don't trigger re-renders when one of them changes.
 */

import { useCallback, useMemo, useRef } from 'react';
import { Box } from '@backstage/ui';
import { PatchDefinition } from '@backstage-community/plugin-entity-patch-common';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import { createAsyncValidators } from '@backstage/plugin-scaffolder-react/alpha';
import { JsonObject, JsonValue } from '@backstage/types';
import { useApiHolder } from '@backstage/frontend-plugin-api';
import { customizeValidator } from '@rjsf/validator-ajv8';
import ajvErrors from 'ajv-errors';
import * as FieldOverrides from '../FieldOverrides';
import { FormConfigProvider } from './FormConfig';
import { PatchForm, PatchFormData } from './PatchForm';

export type PatchesData = Record<string, Record<string, JsonValue>>;

export interface OnChangeOptions {
  isValid: boolean;
  isDirty: boolean;
}

interface PatchesLayoutProps {
  patches: PatchDefinition[];
  initialData?: PatchesData;
  onChange: (data: PatchesData, options: OnChangeOptions) => void;
  extensions?: FieldExtensionOptions<any, any>[];
}

/**
 * Treat undefined, null, and empty arrays as equivalent "empty" when
 * comparing form values for dirty detection. This prevents EntityPicker
 * fields (which normalize undefined → [] on mount) from incorrectly
 * marking the form as dirty before the user has made any changes.
 */
function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || (Array.isArray(v) && v.length === 0);
}

function isPatchDirty(
  current: Record<string, unknown>,
  initial: Record<string, unknown>,
): boolean {
  const allKeys = new Set([...Object.keys(current), ...Object.keys(initial)]);
  for (const key of allKeys) {
    const c = current[key];
    const i = initial[key];
    if (isEmptyValue(c) && isEmptyValue(i)) continue;
    if (JSON.stringify(c) !== JSON.stringify(i)) return true;
  }
  return false;
}

export const PatchesLayout = ({
  patches,
  initialData,
  onChange,
  extensions = [],
}: PatchesLayoutProps) => {
  const apiHolder = useApiHolder();

  const validator = useMemo(() => {
    const v = customizeValidator();
    ajvErrors(v.ajv);
    return v;
  }, []);

  const { fields, validators } = useMemo(
    () => ({
      fields: {
        ...FieldOverrides,
        ...Object.fromEntries(
          extensions.map(({ name, component }) => [name, component]),
        ),
      },
      validators: Object.fromEntries(
        extensions.map(({ name, validation }) => [name, validation]),
      ),
    }),
    [extensions],
  );

  const validate = useCallback(
    (patch: any, data: unknown) =>
      createAsyncValidators(patch as unknown as JsonObject, validators, {
        apiHolder,
      })(data as JsonObject),
    [validators, apiHolder],
  );

  const formConfig = useMemo(
    () => ({ validator, fields, validate }),
    [validator, fields, validate],
  );

  // One ref aggregates all patches — data+validity always coherent in a single object.
  // Using a ref (not state) means one patch changing doesn't re-render sibling PatchForms.
  const patchState = useRef<
    Record<string, { data: PatchFormData; isValid: boolean }>
  >(
    Object.fromEntries(
      patches.map(p => [
        p.name,
        { data: initialData?.[p.name] ?? {}, isValid: true },
      ]),
    ),
  );

  const handlePatchChange = useCallback(
    (patchName: string, data: PatchFormData, isValid: boolean) => {
      patchState.current = {
        ...patchState.current,
        [patchName]: { data, isValid },
      };

      const isDirty = patches.some(p =>
        isPatchDirty(
          patchState.current[p.name]?.data ?? {},
          initialData?.[p.name] ?? {},
        ),
      );

      onChange(
        Object.fromEntries(
          Object.entries(patchState.current).map(([k, v]) => [k, v.data]),
        ),
        {
          isValid: Object.values(patchState.current).every(s => s.isValid),
          isDirty,
        },
      );
    },
    [onChange, patches, initialData],
  );

  return (
    <FormConfigProvider value={formConfig}>
      <Box p="4">
        {patches.map(patch => (
          <PatchForm
            key={patch.name}
            patch={patch}
            initialData={initialData?.[patch.name]}
            onChange={(data, isValid) =>
              handlePatchChange(patch.name, data, isValid)
            }
          />
        ))}
      </Box>
    </FormConfigProvider>
  );
};
