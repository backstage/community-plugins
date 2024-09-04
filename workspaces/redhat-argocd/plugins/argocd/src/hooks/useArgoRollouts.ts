import { useMemo } from 'react';

import { useEntity } from '@backstage/plugin-catalog-react';

import { useKubernetesObjects } from '@janus-idp/shared-react';

import { kubernetesApiRef, kubernetesAuthProvidersApiRef } from '../kubeApi';
import {
  ArgoCDkindPluralMap,
  ArgoCDResourcesKind,
  ArgoResources,
  customResourceKinds,
  k8sResourceTypes,
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
        if (k8sResourceTypes.includes(resource.type)) {
          const knownK8sType = resource.type as keyof ArgoResources;
          acc[knownK8sType] = resource.resources as any[];
        } else if (resource.type === 'customresources') {
          const kind = resource.resources?.[0]?.kind as ArgoCDResourcesKind;
          if (customResourceKinds.includes(kind)) {
            acc[ArgoCDkindPluralMap[kind]] = resource.resources;
          }
        }
        return acc;
      },
      initalArgoResources,
    );
  }, [kubernetesObjects, initalArgoResources]);

  return argoResources;
};
