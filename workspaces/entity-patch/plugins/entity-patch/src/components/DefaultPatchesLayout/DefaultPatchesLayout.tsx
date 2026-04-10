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
import { ErrorBoundary, Progress } from '@backstage/core-components';

import Form from '@rjsf/material-ui';
import ajvErrors from 'ajv-errors';
import { customizeValidator } from '@rjsf/validator-ajv8';
import {
  createAsyncValidators,
  extractSchemaFromStep,
} from '@backstage/plugin-scaffolder-react/alpha';
import { JsonObject, JsonValue } from '@backstage/types';
import {
  PatchDefinition,
  PatchSection,
} from '@backstage-community/plugin-entity-patch-common';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type ErrorSchema } from '@rjsf/utils';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import * as FieldOverrides from '../FieldOverrides';
import { useApiHolder } from '@backstage/frontend-plugin-api';
import { hasErrors } from '../../utils/hasErrors';

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

/** Checks RJSF error schema objects (which use __errors arrays) for any validation failures. */
function hasRjsfErrors(errors: Record<string, any>): boolean {
  for (const error of Object.values(errors)) {
    if (error && '__errors' in error) {
      if ((error.__errors ?? []).length > 0) return true;
      continue;
    }
    if (error && typeof error === 'object' && hasRjsfErrors(error)) return true;
  }
  return false;
}

interface PatchFormSectionProps {
  section: PatchSection;
  patchName: string;
  sectionKey: string;
  isLast: boolean;
  fields: Record<string, any>;
  extraErrors?: ErrorSchema;
  formData: PatchData;
  liveValidate: boolean;
  onFormChange: (data: PatchData, isValid: boolean) => void;
  onBlur: () => void;
  onValidationStart: () => void;
  onValidationEnd: () => void;
  onExtraErrors: (sectionKey: string, errors: ErrorSchema) => void;
  validate: (
    section: PatchSection,
    data: unknown,
  ) => Promise<Record<string, unknown>>;
  validator: ReturnType<typeof customizeValidator>;
}

const PatchFormSection = ({
  section,
  patchName: _patchName,
  sectionKey,
  isLast,
  fields,
  extraErrors,
  formData,
  liveValidate,
  onFormChange,
  onBlur,
  onValidationStart,
  onValidationEnd,
  onExtraErrors,
  validate,
  validator,
}: PatchFormSectionProps) => {
  const { schema, uiSchema } = extractSchemaFromStep(
    section as unknown as JsonObject,
  );

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
          ((fieldUi as Record<string, unknown>)['ui:field'] as string) in fields
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
      <ErrorBoundary>
        <Form
          schema={schema}
          uiSchema={{
            'ui:submitButtonOptions': { norender: true },
            ...uiSchema,
          }}
          validator={validator}
          extraErrors={extraErrors}
          fields={fields}
          formContext={{ formData }}
          formData={formData}
          onChange={({ formData: data }) => {
            onValidationStart();
            // Validate schema independently of liveValidate so Save guard is always accurate.
            const { errors: schemaErrors } = validator.validateFormData(
              data ?? {},
              schema,
            );
            const schemaValid = schemaErrors.length === 0;

            validate(section, data)
              .then(validation => {
                // Always surface async errors so custom fields show feedback
                onExtraErrors(sectionKey, validation as unknown as ErrorSchema);
                const asyncValid = !hasRjsfErrors(validation);
                onFormChange(data ?? {}, asyncValid && schemaValid);
              })
              .finally(onValidationEnd);
          }}
          onBlur={onBlur}
          liveValidate={liveValidate}
          showErrorList="top"
          onSubmit={() => {}}
        />
      </ErrorBoundary>

      {!isLast && (
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
};

export const DefaultPatchesLayout = ({
  patches,
  initialData,
  onChange,
  extensions = [],
}: DefaultPatchesLayoutProps) => {
  const apiHolder = useApiHolder();

  const validator = useMemo(() => {
    const v = customizeValidator();
    ajvErrors(v.ajv);
    return v;
  }, []);

  const [formDataByPatch, setFormDataByPatch] = useState<PatchesData>(
    () => initialData ?? {},
  );

  const [extraErrorsByPatch, setExtraErrorsByPatch] = useState<
    Record<string, ErrorSchema>
  >({});

  const validityRef = useRef<Record<string, boolean>>(
    Object.fromEntries(patches.map(p => [p.name, true])),
  );

  useEffect(() => {
    validityRef.current = Object.fromEntries(patches.map(p => [p.name, true]));
  }, [patches]);

  const [isValidating, setIsValidating] = useState(false);

  const [touchedSections, setTouchedSections] = useState<Set<string>>(
    new Set(),
  );

  const formDataByPatchRef = useRef<PatchesData>(formDataByPatch);
  formDataByPatchRef.current = formDataByPatch;

  const handleChange = (
    patchId: string,
    data: PatchData,
    isPatchValid: boolean,
  ) => {
    validityRef.current = { ...validityRef.current, [patchId]: isPatchValid };
    // Compute updated data synchronously using a ref to avoid calling onChange
    // inside a setState updater (which triggers the React setState-in-render warning).
    const updatedData = { ...formDataByPatchRef.current, [patchId]: data };
    const isValid = !hasErrors(validityRef.current);
    setFormDataByPatch(updatedData);
    onChange(updatedData, { isValid, isDirty: true });
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

  const validate = useMemo(() => {
    return (section: PatchSection, data: unknown) =>
      createAsyncValidators(section as unknown as JsonObject, validators, {
        apiHolder,
      })(data as JsonObject);
  }, [validators, apiHolder]);

  const allSections = patches.flatMap(patch =>
    patch.sections.map(section => ({ patch, section })),
  );

  return (
    <Box p="4">
      {isValidating && <Progress />}
      {allSections.map(({ patch, section }, flatIndex) => {
        const patchName = patch.name;
        const sectionKey = `${patchName}-${section.title ?? ''}-${flatIndex}`;
        return (
          <PatchFormSection
            key={sectionKey}
            section={section}
            patchName={patchName}
            sectionKey={sectionKey}
            isLast={flatIndex === allSections.length - 1}
            fields={fields}
            extraErrors={extraErrorsByPatch[sectionKey] as ErrorSchema}
            formData={formDataByPatch[patchName] ?? {}}
            liveValidate={touchedSections.has(sectionKey)}
            onFormChange={(data: PatchData, isValid: boolean) =>
              handleChange(patchName, data, isValid)
            }
            onBlur={() =>
              setTouchedSections(prev =>
                prev.has(sectionKey) ? prev : new Set([...prev, sectionKey]),
              )
            }
            onValidationStart={() => setIsValidating(true)}
            onValidationEnd={() => setIsValidating(false)}
            onExtraErrors={(key: string, errors: ErrorSchema) =>
              setExtraErrorsByPatch(prev => ({ ...prev, [key]: errors }))
            }
            validate={validate}
            validator={validator}
          />
        );
      })}
    </Box>
  );
};
