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

import { Alert, Box } from '@backstage/ui';
import { Progress } from '@backstage/core-components';

import Form from '@rjsf/material-ui';
import ajvErrors from 'ajv-errors';
import { customizeValidator } from '@rjsf/validator-ajv8';
import {
  createAsyncValidators,
  extractSchemaFromStep,
} from '@backstage/plugin-scaffolder-react/alpha';
import { JsonObject, JsonValue } from '@backstage/types';
import { PatchDefinition, PatchSection } from './types';
import { useMemo, useState } from 'react';
import { type ErrorSchema } from '@rjsf/utils';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import * as FieldOverrides from '../FieldOverrides';
import { useApiHolder } from '@backstage/frontend-plugin-api';

const validator = customizeValidator();
ajvErrors(validator.ajv);

type PatchData = Record<string, JsonValue>;
type PatchesData = Record<string, PatchData>;

interface OnChangeOptions {
  isValid: boolean;
  isDirty: boolean;
}

interface DefaultPatchesLayoutProps {
  patches: PatchDefinition[];
  initialData?: PatchesData;
  onChange: (data: PatchesData, options: OnChangeOptions) => void;
  extensions?: FieldExtensionOptions<any, any>[];
}

export const DefaultPatchesLayout = ({
  patches,
  initialData,
  onChange,
  extensions = [],
}: DefaultPatchesLayoutProps) => {
  const apiHolder = useApiHolder();

  const [formDataByPatch, setFormDataByPatch] = useState<PatchesData>(
    () => initialData ?? {},
  );

  const [extraErrorsByPatch, setExtraErrorsByPatch] = useState<
    Record<string, ErrorSchema>
  >({});

  const [_validityByPatch, setValidityByPatch] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(patches.map(p => [p.name, true])));

  const [isValidating, setIsValidating] = useState(false);

  const [touchedSections, setTouchedSections] = useState<Set<string>>(
    new Set(),
  );

  const handleChange = (
    patchId: string,
    data: PatchData,
    isPatchValid: boolean,
  ) => {
    setValidityByPatch(prevValidity => {
      const updatedValidity = { ...prevValidity, [patchId]: isPatchValid };
      setFormDataByPatch(prevData => {
        const updatedData = { ...prevData, [patchId]: data };
        const isValid = Object.values(updatedValidity).every(Boolean);
        onChange(updatedData, { isValid, isDirty: true });
        return updatedData;
      });
      return updatedValidity;
    });
  };

  const extensionsMap = useMemo(() => {
    return Object.fromEntries(
      extensions.map(({ name, component }) => [name, component]),
    );
  }, [extensions]);

  const fields = useMemo(
    () => ({ ...FieldOverrides, ...extensionsMap }),
    [extensionsMap],
  );

  const validators = useMemo(() => {
    return Object.fromEntries(
      extensions.map(({ name, validation }) => [name, validation]),
    );
  }, [extensions]);

  const validations = useMemo(() => {
    return (section: PatchSection) =>
      createAsyncValidators(section as unknown as JsonObject, validators, {
        apiHolder,
      });
  }, [validators, apiHolder]);

  const hasErrors = (errors: Record<string, any>): boolean => {
    for (const error of Object.values(errors)) {
      if (error && '__errors' in error) {
        if ((error.__errors ?? []).length > 0) return true;
        continue;
      }
      if (error && typeof error === 'object' && hasErrors(error)) return true;
    }
    return false;
  };

  const allSections = patches.flatMap(patch =>
    patch.sections.map(section => ({ patch, section })),
  );

  return (
    <Box p="4">
      {isValidating && <Progress />}
      {allSections.map(({ patch, section }, flatIndex) => {
        const { schema, uiSchema } = extractSchemaFromStep(
          section as unknown as JsonObject,
        );
        const patchName = patch.name;
        const sectionKey = `${patchName}-${flatIndex}`;

        // Detect any ui:field references that are not registered — surface a
        // warning so maintainers know the field is missing instead of seeing
        // a silently empty section.
        const unknownFields = Object.entries(uiSchema)
          .filter(
            ([, fieldUi]) =>
              fieldUi &&
              typeof fieldUi === 'object' &&
              'ui:field' in (fieldUi as object) &&
              !(
                ((fieldUi as Record<string, unknown>)['ui:field'] as string) in
                fields
              ),
          )
          .map(([fieldKey, fieldUi]) => ({
            fieldKey,
            uiField: (fieldUi as Record<string, unknown>)['ui:field'] as string,
          }));

        return (
          <Box key={sectionKey} mb="4">
            {unknownFields.map(({ fieldKey, uiField }) => (
              <Alert
                key={fieldKey}
                status="warning"
                title={`Field "${fieldKey}" uses ui:field: ${uiField} which is not registered`}
                description="Register it via the formFields API or remove it from the patch config."
                data-testid="unknown-field-warning"
              />
            ))}
            <Form
              schema={schema}
              uiSchema={{
                'ui:submitButtonOptions': { norender: true },
                ...uiSchema,
              }}
              validator={validator}
              extraErrors={extraErrorsByPatch[sectionKey] as ErrorSchema}
              fields={fields}
              formContext={{ formData: formDataByPatch[patchName] ?? {} }}
              formData={formDataByPatch[patchName] ?? {}}
              onChange={({ formData: data }) => {
                setIsValidating(true);
                // Validate schema independently of liveValidate so Save guard is always accurate.
                const { errors: schemaErrors } = validator.validateFormData(
                  data ?? {},
                  schema,
                );
                const schemaValid = schemaErrors.length === 0;

                validations(section)(data)
                  .then(validation => {
                    // Always surface async errors so custom fields show feedback
                    setExtraErrorsByPatch(prev => ({
                      ...prev,
                      [sectionKey]: validation as unknown as ErrorSchema,
                    }));
                    const asyncValid = !hasErrors(validation);
                    handleChange(
                      patchName,
                      data ?? {},
                      asyncValid && schemaValid,
                    );
                  })
                  .finally(() => setIsValidating(false));
              }}
              onBlur={() => {
                setTouchedSections(prev =>
                  prev.has(sectionKey) ? prev : new Set([...prev, sectionKey]),
                );
              }}
              liveValidate={touchedSections.has(sectionKey)}
              showErrorList="top"
              onSubmit={() => {}}
            />

            {flatIndex < allSections.length - 1 && (
              <hr
                style={{
                  border: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
                  margin: '16px 0',
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};
