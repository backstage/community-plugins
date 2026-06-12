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
import { EntityPatchClient } from '../api/EntityPatchClient';

/**
 * Iterates over `formData`, skips patches with no fields, and persists each
 * non-empty patch via `client.savePatch`.
 */
export async function saveAllPatches(
  client: EntityPatchClient,
  kind: string,
  namespace: string,
  name: string,
  formData: Record<string, unknown>,
): Promise<void> {
  for (const [patchName, patchData] of Object.entries(formData)) {
    const record = patchData as Record<string, unknown>;
    // Skip patches with no data — nothing to persist
    if (!record || Object.keys(record).length === 0) continue;
    await client.savePatch(kind, namespace, name, patchName, record);
  }
}
