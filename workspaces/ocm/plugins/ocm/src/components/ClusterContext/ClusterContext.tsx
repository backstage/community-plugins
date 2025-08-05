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
import { createContext, useContext, useMemo } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';

import { useApi } from '@backstage/core-plugin-api';
import { ErrorResponseBody } from '@backstage/errors';
import { useEntity } from '@backstage/plugin-catalog-react';

import {
  ANNOTATION_PROVIDER_ID,
  Cluster,
} from '@backstage-community/plugin-ocm-common';

import { OcmApiRef } from '../../api';

/**
 * @public
 */
export type ClusterContextType = {
  data: Cluster | null;
  loading: boolean;
  error: Error | null;
};

const ClusterContext = createContext<ClusterContextType>(
  {} as ClusterContextType,
);

/**
 * @public
 */
export const ClusterContextProvider = (props: any) => {
  const { entity } = useEntity();
  const ocmApi = useApi(OcmApiRef);
  const providerId = entity.metadata.annotations![ANNOTATION_PROVIDER_ID];
  const [{ value: cluster, loading, error: asyncError }, refresh] = useAsyncFn(
    async () => {
      if (providerId) {
        const cl = await ocmApi.getClusterByName(
          providerId,
          entity.metadata.name,
        );
        return cl;
      }
      return null;
    },
    [providerId, entity.metadata.name],
    { loading: true },
  );
  useDebounce(refresh, 10);
  const isError = Boolean(asyncError || (cluster && 'error' in cluster));
  const error = isError
    ? asyncError ||
      Object.assign(new Error((cluster as ErrorResponseBody)?.error?.message), {
        ...(cluster as ErrorResponseBody)?.error,
      })
    : null;

  const value = useMemo(
    () => ({
      data: isError || loading ? null : (cluster as Cluster),
      loading,
      error,
    }),
    [cluster, isError, loading, error],
  );

  if (!providerId) {
    return <>{props.children}</>;
  }

  return (
    <ClusterContext.Provider value={value}>
      {props.children}
    </ClusterContext.Provider>
  );
};

/**
 * @public
 */
export const useCluster = () => useContext(ClusterContext);
