import { useMemo } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@janus-idp/shared-react';
import pluralize from 'pluralize';

import { kubernetesApiRef, kubernetesAuthProvidersApiRef } from '../kubeApi';
import {
  ArgoCDkindPluralMap,
  ArgoCDResourcesKind,
  ArgoResources,
} from '../types/resources';

export const useArgocdRollouts = (): ArgoResources => {
  const { entity } = useEntity();

  const { kubernetesObjects } = useKubernetesObjects(
    entity,
    kubernetesApiRef,
    kubernetesAuthProvidersApiRef,
  );

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
            acc[pluralize(kind).toLowerCase()] = resource.resources;
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
