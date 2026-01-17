/*
 * Copyright 2024 The Backstage Authors
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
import pluralize from 'pluralize';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes-react';

import {
  ArgoCDkindPluralMap,
  ArgoCDResourcesKind,
  ArgoResources,
} from '../types/resources';

export const useArgocdRollouts = (): ArgoResources => {
  const { entity } = useEntity();

  const { kubernetesObjects } = useKubernetesObjects(entity);

  const initalArgoResources = useMemo<ArgoResources>(
    () =>
      Object.values(ArgoCDkindPluralMap).reduce((acc, value) => {
        acc[value] = [];
        return acc;
      }, {} as ArgoResources),
    [],
  );

  const argoResources = useMemo<ArgoResources>(() => {
    return (kubernetesObjects?.items?.[0]?.resources || []).reduce(
      (acc, resource) => {
        if (resource.type === 'customresources') {
          const kind = resource.resources?.[0]?.kind as ArgoCDResourcesKind;
          if (kind) {
            acc[pluralize(kind).toLocaleLowerCase('en-US')] =
              resource.resources;
          }
        } else {
          const knownK8sType = resource.type as keyof ArgoResources;
          acc[knownK8sType] = resource.resources as any[];
        }
        return acc;
      },
      initalArgoResources,
    );
  }, [kubernetesObjects, initalArgoResources]);

  return argoResources;
};
