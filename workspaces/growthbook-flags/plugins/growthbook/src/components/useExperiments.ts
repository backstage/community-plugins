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
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import type { ExperimentRow } from '@backstage-community/plugin-growthbook-common';
import { growthbookFlagsApiRef } from '../api';

const NO_EXPERIMENTS: ExperimentRow[] = [];

/**
 * Experiments for a GrowthBook project. Resolves to an empty list while
 * loading, when no project is given, and on any failure, so the flags view
 * never depends on it.
 */
export function useExperiments(project?: string): ExperimentRow[] {
  const api = useApi(growthbookFlagsApiRef);
  const { value } = useAsync(async () => {
    if (!project) return NO_EXPERIMENTS;
    try {
      return await api.getExperiments(project);
    } catch {
      return NO_EXPERIMENTS;
    }
  }, [api, project]);
  return value ?? NO_EXPERIMENTS;
}
