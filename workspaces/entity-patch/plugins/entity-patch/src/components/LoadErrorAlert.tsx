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
import { Alert, Button } from '@backstage/ui';

/**
 * Dismissable danger alert shown when the initial patch data could not be
 * loaded from the backend. Manages its own dismissed state internally.
 */
export const LoadErrorAlert = ({ show }: { show: boolean }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return (
    <Alert
      status="danger"
      title="Could not load patch data. Please try again."
      customActions={
        <Button variant="secondary" onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
      }
      style={{ marginBottom: 16 }}
    />
  );
};
