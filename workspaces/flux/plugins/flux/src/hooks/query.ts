/*
 * Copyright 2025 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { useCustomResources } from '@backstage/plugin-kubernetes';
import {
  ClusterAttributes,
  KubernetesFetchError,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';
import {
  FluxObject,
  GitRepository,
  HelmRelease,
  OCIRepository,
  Kustomization,
  ImagePolicy,
  gitRepositoriesGVK,
  helmReleaseGVK,
  ociRepositoriesGVK,
  kustomizationGVK,
  helmRepositoryGVK,
  HelmRepository,
  imagePolicyGVK,
} from '../objects';
import { Deployment, Source } from '../components/helpers';

function toErrors(
  cluster: ClusterAttributes,
  errors: KubernetesFetchError[],
): Error[] {
  return errors.map(error => {
    if (error.errorType === 'FETCH_ERROR') {
      return new Error(`FETCH_ERROR (cluster=${cluster}): ${error.message}`);
    }
    return new Error(
      `${error.errorType} (cluster=${cluster}, statusCode=${error.statusCode}): ${error.resourcePath}`,
    );
  });
}

type resourceCreator<T> = ({
  clusterName,
  payload,
}: {
  clusterName: string;
  payload: string;
}) => T;

function toResponse<T extends FluxObject>(
  create: resourceCreator<T>,
  kubernetesObjects?: ObjectsByEntityResponse,
) {
  if (!kubernetesObjects) {
    return {
      data: undefined,
      kubernetesErrors: undefined,
    };
  }

  const data = kubernetesObjects.items.flatMap(({ cluster, resources }) => {
    return resources?.flatMap(resourceKind => {
      return resourceKind.resources.map(resource =>
        create({
          clusterName: cluster.name,
          payload: JSON.stringify(resource),
        }),
      );
    });
  });

  const kubernetesErrors = kubernetesObjects.items.flatMap(item =>
    toErrors(item.cluster, item.errors),
  );

  return {
    data,
    errors: kubernetesErrors.length > 0 ? kubernetesErrors : undefined,
  };
}

/**
 * @public
 */
export interface Response<T> {
  data?: T[];
  loading: boolean;
  errors?: Error[];
}

/**
 * Query for the HelmReleases associated with this Entity.
 * @public
 */
export function useHelmReleases(entity: Entity): Response<HelmRelease> {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    helmReleaseGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<HelmRelease>(
    item => new HelmRelease(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the GitRepositories associated with this Entity.
 * @public
 */
export function useGitRepositories(entity: Entity): Response<GitRepository> {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    gitRepositoriesGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<GitRepository>(
    item => new GitRepository(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the OCIRepositories associated with this Entity.
 * @public
 */
export function useOCIRepositories(entity: Entity): Response<OCIRepository> {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    ociRepositoriesGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<OCIRepository>(
    item => new OCIRepository(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the Kustomizations associated with this Entity.
 * @public
 */
export function useKustomizations(entity: Entity): Response<Kustomization> {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    kustomizationGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<Kustomization>(
    item => new Kustomization(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the HelmRepositories associated with this Entity.
 * @public
 */
export function useHelmRepositories(entity: Entity): Response<HelmRepository> {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    helmRepositoryGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<HelmRepository>(
    item => new HelmRepository(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the Flux Deployments - Kustomizations and Helm Releases - associated with this Entity.
 * @public
 */

export function useFluxDeployments(entity: Entity): Response<Deployment> {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    helmReleaseGVK,
    kustomizationGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<Deployment>(item => {
    const { kind } = JSON.parse(item.payload as string);
    return kind === 'Kustomization'
      ? new Kustomization(item)
      : new HelmRelease(item);
  }, kubernetesObjects);

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the Flux Sources - HelmReposiotry, GitRepository And OCI Repository - associated with this Entity.
 * @public
 */

export function useFluxSources(entity: Entity): Response<Source> {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    helmRepositoryGVK,
    ociRepositoriesGVK,
    gitRepositoriesGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<Source>(item => {
    const { kind } = JSON.parse(item.payload as string);

    switch (kind) {
      case 'OCIRepository':
        return new OCIRepository(item);
      case 'HelmRepository':
        return new HelmRepository(item);
      default:
        return new GitRepository(item);
    }
  }, kubernetesObjects);

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}

/**
 * Query for the Image Policies associated with this Entity.
 * @public
 */
export function useImagePolicies(entity: Entity): Response<ImagePolicy> {
  const { kubernetesObjects, loading, error } = useCustomResources(entity, [
    imagePolicyGVK,
  ]);

  const { data, kubernetesErrors } = toResponse<ImagePolicy>(
    item => new ImagePolicy(item),
    kubernetesObjects,
  );

  return {
    data,
    loading,
    errors: error
      ? [new Error(error), ...(kubernetesErrors || [])]
      : kubernetesErrors,
  };
}
