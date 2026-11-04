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
import { useMemo } from 'react';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/frontend-plugin-api';
import { EntityPatchClient } from '../api/EntityPatchClient';

/**
 * Returns a memoised {@link EntityPatchClient} bound to the current discovery
 * and fetch APIs. Re-creates the client only when either API reference changes.
 */
export function useEntityPatchClient(): EntityPatchClient {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  return useMemo(
    () => new EntityPatchClient({ discoveryApi, fetchApi }),
    [discoveryApi, fetchApi],
  );
}
