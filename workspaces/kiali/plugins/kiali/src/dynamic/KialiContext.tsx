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
import {
  KIALI_NAMESPACE,
  KIALI_PROVIDER,
} from '@backstage-community/plugin-kiali-common';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { createContext, useContext, useMemo } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';
import { NamespaceInfo } from '../pages/Overview/NamespaceInfo';
import { getNamespaces } from '../pages/Overview/OverviewPage';
import { kialiApiRef } from '../services/Api';

type KialiEntityContextType = {
  data: NamespaceInfo[] | null;
  loading: boolean;
  error: Error | null;
};

const KialiEntityContext = createContext<KialiEntityContextType>(
  {} as KialiEntityContextType,
);

export const KialiContextProvider = (props: any) => {
  const { entity } = useEntity();
  const kialiClient = useApi(kialiApiRef);
  if (entity.metadata.annotations) {
    kialiClient.setAnnotation(
      KIALI_PROVIDER,
      entity.metadata.annotations[KIALI_PROVIDER],
    );
  }

  const [{ value: namespace, loading, error: asyncError }, refresh] =
    useAsyncFn(
      async () => {
        const annotations = entity?.metadata?.annotations || undefined;
        let ns: string[];
        if (!annotations) {
          ns = [];
        } else {
          const ant = decodeURIComponent(annotations[KIALI_NAMESPACE]);
          if (ant) {
            ns = ant.split(',');
          }
          ns = [];
        }
        const filteredNs = await kialiClient
          .getNamespaces()
          .then(namespacesResponse => {
            const allNamespaces: NamespaceInfo[] = getNamespaces(
              namespacesResponse,
              [],
            );
            const namespaceInfos = allNamespaces.filter(nsInfo =>
              ns.includes(nsInfo.name),
            );
            return namespaceInfos;
          });
        return filteredNs;
      },
      [],
      { loading: true },
    );
  useDebounce(refresh, 10);
  const isError = Boolean(asyncError);
  const error = isError ? asyncError || Object.assign(new Error()) : null;

  const value = useMemo(
    () => ({
      data: isError || loading ? null : (namespace as NamespaceInfo[]),
      loading,
      error,
    }),
    [namespace, isError, loading, error],
  );

  return (
    <KialiEntityContext.Provider value={value}>
      {props.children}
    </KialiEntityContext.Provider>
  );
};
export const useKialiEntityContext = () => useContext(KialiEntityContext);
