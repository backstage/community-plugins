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
import { createContext, ReactNode, useContext } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import type { JsonValue } from '@backstage/types';
import { Skeleton, Text } from '@backstage/ui';

/**
 * State of an {@link ApiFetcher} request.
 *
 * @public
 */
export type ApiFetcherResult = {
  data: JsonValue | undefined;
  loading: boolean;
  error: Error | undefined;
};

const ApiFetcherContext = createContext<ApiFetcherResult | null>(null);

/**
 * Reads the state of the closest {@link ApiFetcher}.
 *
 * @public
 */
export const useApiFetcherData = (): ApiFetcherResult => {
  const context = useContext(ApiFetcherContext);
  if (!context) {
    throw new Error('useApiFetcherData must be used within an ApiFetcher');
  }
  return context;
};

/**
 * Props for {@link ApiFetcher}.
 *
 * @public
 */
export type ApiFetcherProps = {
  /** Path relative to `backend.baseUrl`, e.g. `/api/catalog/entities`. */
  url: string;
  children: ReactNode | ((result: ApiFetcherResult) => ReactNode);
};

/**
 * Fetches JSON from the Backstage backend and exposes it to its children.
 *
 * @public
 */
export const ApiFetcher = ({ url, children }: ApiFetcherProps) => {
  const configApi = useApi(configApiRef);
  const fetchApi = useApi(fetchApiRef);

  const {
    value: data,
    error,
    loading,
  } = useAsync(async (): Promise<JsonValue> => {
    const baseUrl = configApi.getString('backend.baseUrl');
    const response = await fetchApi.fetch(`${baseUrl}${url}`);

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(
        `Unsupported content type: ${
          contentType || 'unknown'
        }. Expected application/json.`,
      );
    }

    return response.json();
  }, [url, configApi, fetchApi]);

  const result: ApiFetcherResult = { data, loading, error };

  if (typeof children === 'function') {
    return <>{children(result)}</>;
  }

  return (
    <ApiFetcherContext.Provider value={result}>
      {children}
    </ApiFetcherContext.Provider>
  );
};

/**
 * Props for {@link ApiFetcherContent}.
 *
 * @public
 */
export type ApiFetcherContentProps = {
  children: ReactNode;
  showLoading?: boolean;
  showError?: boolean;
};

/**
 * Renders its children once the closest {@link ApiFetcher} has data.
 *
 * @public
 */
export const ApiFetcherContent = ({
  children,
  showLoading = true,
  showError = true,
}: ApiFetcherContentProps) => {
  const { data, loading, error } = useApiFetcherData();

  if (loading && showLoading) {
    return <Skeleton width="100%" height={24} />;
  }

  if (error && showError) {
    return <Text color="danger">{error.message}</Text>;
  }

  if (data === undefined) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Props for {@link ApiFetcherData}.
 *
 * @public
 */
export type ApiFetcherDataProps = {
  /** Dot-separated path into the response, e.g. `items.0.metadata.name`. */
  path?: string;
  render: (value: JsonValue | undefined) => ReactNode;
};

const getValueByPath = (
  value: JsonValue | undefined,
  path: string,
): JsonValue | undefined =>
  path.split('.').reduce<JsonValue | undefined>((current, part) => {
    if (Array.isArray(current)) {
      return current[parseInt(part, 10)];
    }
    if (current !== null && typeof current === 'object') {
      return current[part];
    }
    return undefined;
  }, value);

/**
 * Renders a value from the closest {@link ApiFetcher} response.
 *
 * @public
 */
export const ApiFetcherData = ({ path, render }: ApiFetcherDataProps) => {
  const { data } = useApiFetcherData();

  if (data === undefined) {
    return null;
  }

  return <>{render(path ? getValueByPath(data, path) : data)}</>;
};
