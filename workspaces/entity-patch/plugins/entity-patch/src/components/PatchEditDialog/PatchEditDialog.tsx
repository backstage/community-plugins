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
import { useState } from 'react';
import { JsonValue } from '@backstage/types';
import { PatchDefinition } from '../DefaultPatchesLayout/types';
import { RiCloseLine } from '@remixicon/react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { Button, ButtonIcon } from '@backstage/ui';
import { DefaultPatchesLayout } from '../DefaultPatchesLayout';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import { alertApiRef, useApi } from '@backstage/frontend-plugin-api';

type PatchData = Record<string, JsonValue>;
type PatchesData = Record<string, PatchData>;

export type PatchEditDialogProps = {
  dialog: { close: () => void };
  patches: PatchDefinition[];
  initialData?: PatchesData;
  onSave: (data: PatchesData) => Promise<void>;
  formFields: FieldExtensionOptions<any, any>[];
};

export const PatchEditDialog = ({
  dialog,
  patches,
  initialData,
  onSave,
  formFields
}: PatchEditDialogProps) => {
  const alertApi = useApi(alertApiRef);
  const [formData, setFormData] = useState<PatchesData>(initialData ?? {});
  const [isFormValid, setIsFormValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = async () => {
    try {
      await onSave(formData);
      alertApi.post({
        message: 'Patch saved successfully.',
        severity: 'success',
        display: 'transient',
      });
      dialog.close();
    } catch (err: any) {
      alertApi.post({
        message: `Failed to save patch: ${err?.message ?? 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  return (
    <Dialog open onClose={() => dialog.close()} fullWidth maxWidth="lg">
      <DialogTitle>Edit Patch</DialogTitle>
      <ButtonIcon
        style={{ position: 'absolute', top: 8, right: 8 }}
        variant="tertiary"
        icon={<RiCloseLine />}
        onClick={() => dialog.close()}
      />
      <DialogContent>
        <DefaultPatchesLayout
          onChange={(data, { isValid, isDirty: dirty }) => {
            setFormData(data);
            setIsFormValid(isValid);
            if (dirty) setIsDirty(true);
          }}
          initialData={initialData}
          patches={patches}
          extensions={formFields}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={() => dialog.close()}>
          Close
        </Button>
        <Button
          variant="primary"
          isDisabled={!isDirty || !isFormValid}
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
