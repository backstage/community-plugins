/*
 * Copyright 2023 The Backstage Authors
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
import useAsync from 'react-use/esm/useAsync';
import {
  octopusDeployApiRef,
  OctopusEnvironment,
  OctopusReleaseProgression,
} from '../api';

export function useReleases(
  projectId: string,
  releaseHistoryCount: number,
  spaceId?: string,
): {
  environments?: OctopusEnvironment[];
  releases?: OctopusReleaseProgression[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(octopusDeployApiRef);

  const { value, loading, error } = useAsync(() => {
    return api.getReleaseProgression({
      projectReference: { projectId, spaceId },
      releaseHistoryCount,
    });
  }, [api, projectId, spaceId, releaseHistoryCount]);

  return {
    environments: value?.Environments,
    releases: value?.Releases,
    loading,
    error,
  };
}
