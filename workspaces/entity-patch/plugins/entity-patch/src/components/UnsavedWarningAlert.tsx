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
import { Alert, Button } from '@backstage/ui';

type UnsavedWarningAlertProps = {
  show: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
};

/**
 * Warning alert displayed when the user attempts to close a form with unsaved
 * changes. Presents "Keep editing" and "Discard changes" actions.
 */
export const UnsavedWarningAlert = ({
  show,
  onKeepEditing,
  onDiscard,
}: UnsavedWarningAlertProps) => {
  if (!show) return null;

  return (
    <Alert
      status="warning"
      title="You have unsaved changes. Discard them?"
      customActions={
        <>
          <Button variant="secondary" onClick={onKeepEditing}>
            Keep editing
          </Button>
          <Button
            variant="primary"
            onClick={onDiscard}
            style={{ marginLeft: 8 }}
          >
            Discard changes
          </Button>
        </>
      }
      style={{ marginBottom: 16 }}
    />
  );
};
