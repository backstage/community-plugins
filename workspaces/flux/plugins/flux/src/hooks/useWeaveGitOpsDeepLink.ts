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
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  FluxObject,
  GitRepository,
  HelmRelease,
  Kustomization,
  HelmRepository,
  OCIRepository,
  ImagePolicy,
} from '../objects';

const typedUrl = (baseUrl: string, a: FluxObject, type: string): string => {
  const queryStringData = {
    clusterName: a.clusterName,
    name: a.name,
    namespace: a.namespace,
  };

  const searchParams = new URLSearchParams(queryStringData);

  return `${baseUrl.replace(
    /\/$/,
    '',
  )}/${type}/details?${searchParams.toString()}`;
};

export const useWeaveGitOpsDeepLink = (
  resource: FluxObject,
): string | undefined => {
  const config = useApi(configApiRef);

  const baseUrl = config.getOptionalString('flux.gitops.baseUrl');

  if (!baseUrl) {
    return undefined;
  }

  switch (resource.type) {
    case 'HelmRelease':
      return typedUrl(baseUrl, resource as HelmRelease, 'helm_release');
    case 'GitRepository':
      return typedUrl(baseUrl, resource as GitRepository, 'git_repo');
    case 'OCIRepository':
      return typedUrl(baseUrl, resource as OCIRepository, 'oci');
    case 'Kustomization':
      return typedUrl(baseUrl, resource as Kustomization, 'kustomization');
    case 'HelmRepository':
      return typedUrl(baseUrl, resource as HelmRepository, 'helm_repo');
    case 'ImagePolicy':
      return typedUrl(baseUrl, resource as ImagePolicy, 'image_policy');
    default:
      return undefined;
  }
};
