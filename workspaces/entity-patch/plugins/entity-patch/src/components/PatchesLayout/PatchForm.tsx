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
 * Self-contained patch form.
 *
 * Owns its own local state (formData, extraErrors, isTouched, isValidating)
 * and calls onChange(data, isValid) when the user edits anything.
 * No context required — reads shared config from FormConfigContext.
 */

import { useState } from 'react';
import { Alert, Box } from '@backstage/ui';
import { ErrorBoundary } from '@backstage/core-components';
import Form from '@rjsf/material-ui';
import { extractSchemaFromStep } from '@backstage/plugin-scaffolder-react/alpha';
import { JsonObject, JsonValue } from '@backstage/types';
import { PatchDefinition } from '@backstage-community/plugin-entity-patch-common';
import { type ErrorSchema } from '@rjsf/utils';
import { useFormConfig } from './FormConfig';

export type PatchFormData = Record<string, JsonValue>;

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

interface PatchFormProps {
  patch: PatchDefinition;
  initialData?: PatchFormData;
  onChange: (data: PatchFormData, isValid: boolean) => void;
}

export const PatchForm = ({ patch, initialData, onChange }: PatchFormProps) => {
  const { validator, fields, validate } = useFormConfig();

  const [formData, setFormData] = useState<PatchFormData>(initialData ?? {});
  const [extraErrors, setExtraErrors] = useState<ErrorSchema>(
    {} as ErrorSchema,
  );
  const [isTouched, setIsTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [hasSchemaErrors, setHasSchemaErrors] = useState(false);

  const { schema, uiSchema } = extractSchemaFromStep(
    patch as unknown as JsonObject,
  );

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

  const handleChange = async (data: PatchFormData | undefined) => {
    const next = data ?? {};
    setFormData(next);
    setIsValidating(true);

    const { errors: schemaErrors } = validator.validateFormData(next, schema);
    const schemaValid = schemaErrors.length === 0;
    setHasSchemaErrors(!schemaValid);

    try {
      const validation = await validate(patch, next);
      setExtraErrors(validation as unknown as ErrorSchema);
      onChange(next, !hasRjsfErrors(validation) && schemaValid);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Box mb="4">
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
          onChange={({ formData: data }) => handleChange(data)}
          onBlur={() => setIsTouched(true)}
          liveValidate={isTouched || hasSchemaErrors}
          showErrorList="top"
          onSubmit={() => {}}
        />
      </ErrorBoundary>

      {isValidating && (
        <Box
          mt="2"
          style={{ fontSize: 12, color: '#666' }}
          role="progressbar"
          aria-label="Validating"
        >
          Validating…
        </Box>
      )}
    </Box>
  );
};
