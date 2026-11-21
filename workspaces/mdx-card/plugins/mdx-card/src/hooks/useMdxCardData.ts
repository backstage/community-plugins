/*
 * Copyright 2026 The Backstage Authors
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
import { Environment } from 'nunjucks';
import useAsync from 'react-use/esm/useAsync';
import {
  DiscoveryApi,
  discoveryApiRef,
  FetchApi,
  fetchApiRef,
  IdentityApi,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import type { Entity } from '@backstage/catalog-model';
import type { JsonValue } from '@backstage/types';
import type { DataFetcher, UserInformation } from '../types';

const nunjucks = new Environment();
nunjucks.addGlobal('now', () => Date.now());

type TemplateContext = {
  user: UserInformation;
  entity?: Entity;
};

const renderApiUrl = (apiUrl: string, context: TemplateContext) =>
  apiUrl.includes('{{') && apiUrl.includes('}}')
    ? nunjucks.renderString(apiUrl, context)
    : apiUrl;

const getUserInformation = async (
  identityApi: IdentityApi,
): Promise<UserInformation> => {
  const [profile, identity] = await Promise.all([
    identityApi.getProfileInfo(),
    identityApi.getBackstageIdentity(),
  ]);
  return {
    profile,
    identity,
    displayName: profile.displayName ?? identity.userEntityRef,
  };
};

const fetchData = async (
  dataFetcher: DataFetcher,
  apis: { discoveryApi: DiscoveryApi; fetchApi: FetchApi },
  context: TemplateContext,
): Promise<JsonValue> => {
  if (!dataFetcher.apiUrl || !dataFetcher.pluginId) {
    return {
      error: `Data fetcher "${dataFetcher.name}" requires both pluginId and apiUrl`,
    };
  }

  try {
    const baseUrl = await apis.discoveryApi.getBaseUrl(dataFetcher.pluginId);
    const path = renderApiUrl(dataFetcher.apiUrl, context).replace(/^\//, '');
    const response = await apis.fetchApi.fetch(`${baseUrl}/${path}`);
    const contentType = response.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      return {
        error: `Unsupported content type: ${
          contentType || 'unknown'
        }. Expected application/json.`,
      };
    }
    return await response.json();
  } catch (e) {
    return {
      error: `Failed to retrieve data for "${dataFetcher.name}": ${
        e instanceof Error ? e.message : String(e)
      }`,
    };
  }
};

/**
 * Loads the signed-in user and the responses of all data fetchers, keyed by
 * data fetcher name.
 */
export const useMdxCardData = ({
  dataFetchers,
  entity,
}: {
  dataFetchers?: DataFetcher[];
  entity?: Entity;
}) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const identityApi = useApi(identityApiRef);
  const dataFetchersKey = JSON.stringify(dataFetchers ?? []);

  return useAsync(async (): Promise<Record<string, unknown>> => {
    const user = await getUserInformation(identityApi);
    const context = { user, entity };
    const responses = await Promise.all(
      (dataFetchers ?? []).map(
        async dataFetcher =>
          [
            dataFetcher.name,
            await fetchData(dataFetcher, { discoveryApi, fetchApi }, context),
          ] as const,
      ),
    );
    return { ...context, ...Object.fromEntries(responses) };
  }, [dataFetchersKey, entity, discoveryApi, fetchApi, identityApi]);
};
