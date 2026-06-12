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
import { useCallback, useEffect, useRef, useState } from 'react';
import { toastApiRef, useApi } from '@backstage/frontend-plugin-api';

/**
 * Wraps an async save function with shared toast notifications and an
 * `isSaving` loading flag.
 *
 * @param onSuccess - Called after a successful save (after the success toast is
 *   enqueued). Use this to reset dirty state, close dialogs, etc.
 *
 * @example
 * ```tsx
 * const { executeSave, isSaving } = usePatchSave(() => setIsDirty(false));
 * const handleSave = () => executeSave(() => saveAllPatches(...));
 * ```
 */
export function usePatchSave(onSuccess?: () => void): {
  executeSave: (saveFn: () => Promise<void>) => Promise<void>;
  isSaving: boolean;
} {
  const toastApi = useApi(toastApiRef);
  const [isSaving, setIsSaving] = useState(false);

  // Keep ref updated on every render so executeSave always calls the latest
  // callback without needing it in the useCallback dep array.
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  const executeSave = useCallback(
    async (saveFn: () => Promise<void>) => {
      setIsSaving(true);
      try {
        await saveFn();
        toastApi.post({
          title: 'Patch saved successfully.',
          status: 'success',
          timeout: 5000,
        });
        onSuccessRef.current?.();
      } catch (err: any) {
        toastApi.post({
          title: 'Failed to save patch',
          description: err?.message ?? 'Unknown error',
          status: 'danger',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [toastApi],
  );

  return { executeSave, isSaving };
}
