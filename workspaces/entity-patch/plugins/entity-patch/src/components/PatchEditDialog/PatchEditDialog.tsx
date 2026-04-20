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
import { useRef, useState } from 'react';
import { JsonValue } from '@backstage/types';
import { PatchDefinition } from '@backstage-community/plugin-entity-patch-common';
import { Button, ButtonIcon, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiCloseLine } from '@remixicon/react';
// TODO: Replace with BUI Dialog once @backstage/ui exports Dialog components.
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import { PatchesLayout } from '../PatchesLayout/PatchesLayout';
import { FieldExtensionOptions } from '@backstage/plugin-scaffolder-react';
import { LoadErrorAlert } from '../LoadErrorAlert';
import { UnsavedWarningAlert } from '../UnsavedWarningAlert';
import { usePatchSave } from '../../hooks/usePatchSave';

type PatchData = Record<string, JsonValue>;
type PatchesData = Record<string, PatchData>;

export type PatchEditDialogProps = {
  dialog: { close: () => void };
  patches: PatchDefinition[];
  initialData?: PatchesData;
  loadError?: boolean;
  onSave: (data: PatchesData) => Promise<void>;
  formFields: FieldExtensionOptions<any, any>[];
};

export const PatchEditDialog = ({
  dialog,
  patches,
  initialData,
  loadError,
  onSave,
  formFields,
}: PatchEditDialogProps) => {
  const [formData, setFormData] = useState<PatchesData>(initialData ?? {});
  const [isFormValid, setIsFormValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const { executeSave, isSaving } = usePatchSave(() => {
    setIsDirty(false);
    setShowUnsavedWarning(false);
    dialog.close();
  });

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
      dialogContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    dialog.close();
  };

  const handleSave = () => executeSave(() => onSave(formData));

  let saveTooltip = '';
  if (!isFormValid) saveTooltip = 'Fix validation errors before saving';
  else if (!isDirty) saveTooltip = 'No changes to save';

  return (
    <Dialog
      open
      onClose={handleClose}
      aria-labelledby="patch-edit-dialog-title"
      PaperProps={{ style: { width: 720, maxWidth: '90vw' } }}
    >
      <DialogTitle id="patch-edit-dialog-title">Edit Entity</DialogTitle>
      <ButtonIcon
        style={{ position: 'absolute', top: 8, right: 8 }}
        variant="tertiary"
        icon={<RiCloseLine />}
        aria-label="Close dialog"
        onClick={handleClose}
      />
      <DialogContent ref={dialogContentRef}>
        <LoadErrorAlert show={!!loadError} />
        <UnsavedWarningAlert
          show={showUnsavedWarning}
          onKeepEditing={() => setShowUnsavedWarning(false)}
          onDiscard={() => dialog.close()}
        />
        <PatchesLayout
          onChange={(data, { isValid, isDirty: dirty }) => {
            setFormData(data);
            setIsFormValid(isValid);
            if (dirty) {
              setIsDirty(true);
              setShowUnsavedWarning(false);
            }
          }}
          initialData={initialData}
          patches={patches}
          extensions={formFields}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <TooltipTrigger isDisabled={!saveTooltip}>
          <Button
            variant="primary"
            isDisabled={!isDirty || !isFormValid || isSaving}
            onClick={handleSave}
          >
            Save
          </Button>
          <Tooltip>{saveTooltip}</Tooltip>
        </TooltipTrigger>
      </DialogActions>
    </Dialog>
  );
};
