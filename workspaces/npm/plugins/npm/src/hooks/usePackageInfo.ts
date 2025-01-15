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
import useAsync from 'react-use/esm/useAsync';

import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { NotFoundError } from '@backstage/errors';

import {
  NpmAnnotation,
  NpmRegistryClient,
} from '@backstage-community/plugin-npm-common';

import { NpmBackendApiRef } from '../api';

export const usePackageInfo = () => {
  const config = useApi(configApiRef);
  const backendApi = useApi(NpmBackendApiRef);
  const { entity } = useEntity();
  const entityRef = stringifyEntityRef(entity);

  const packageName = entity.metadata.annotations?.[NpmAnnotation.PACKAGE_NAME];

  const useBackend =
    Boolean(config.getOptionalString('npm.defaultRegistry')) ||
    Boolean(entity.metadata.annotations?.[NpmAnnotation.REGISTRY_NAME]);

  const {
    value: packageInfo,
    loading,
    error,
  } = useAsync(() => {
    if (!packageName) {
      throw new NotFoundError(
        `No pacakge name found for entity ref '${entityRef}'`,
      );
    }
    if (useBackend) {
      return backendApi.getPackageInfo(entityRef);
    }
    return new NpmRegistryClient({}).getPackageInfo(packageName);
  }, [entityRef, packageName, useBackend]);

  return {
    packageInfo,
    loading,
    error,
  };
};
