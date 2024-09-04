import { createApiRef } from '@backstage/core-plugin-api';
import {
  KubernetesApi,
  KubernetesAuthProvidersApi,
} from '@backstage/plugin-kubernetes-react';

export const kubernetesAuthProvidersApiRef =
  createApiRef<KubernetesAuthProvidersApi>({
    id: 'plugin.argocd-kubernetes-auth-providers.service',
  });

export const kubernetesApiRef = createApiRef<KubernetesApi>({
  id: 'plugin.argocd-kubernetes.service',
});
