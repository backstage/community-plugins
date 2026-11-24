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
import useAsync from 'react-use/esm/useAsync';
import { useApiHolder } from '@backstage/core-plugin-api';
import type { DataFetcher } from '@backstage-community/plugin-mdx-card-common';
import { mdxCardApiRef } from '../api';

const mergeDataFetchers = (
  stored: DataFetcher[],
  overrides: DataFetcher[] = [],
) => [
  ...stored.filter(fetcher => !overrides.some(o => o.name === fetcher.name)),
  ...overrides,
];

/**
 * Resolves the template and data fetchers of a card, loading the stored
 * template when `templateRef` is set.
 */
export const useMdxCardSource = ({
  template,
  templateRef,
  dataFetchers,
}: {
  template?: string;
  templateRef?: string;
  dataFetchers?: DataFetcher[];
}) => {
  const mdxCardApi = useApiHolder().get(mdxCardApiRef);

  return useAsync(async () => {
    if (template !== undefined) {
      return { template, dataFetchers: dataFetchers ?? [] };
    }
    if (!templateRef) {
      throw new Error('MDX card needs either a template or a templateRef');
    }
    if (!mdxCardApi) {
      throw new Error(
        'templateRef requires the MDX card API, which is not installed',
      );
    }
    const stored = await mdxCardApi.getTemplate(templateRef);
    return {
      template: stored.template,
      dataFetchers: mergeDataFetchers(stored.dataFetchers, dataFetchers),
    };
  }, [template, templateRef, JSON.stringify(dataFetchers ?? []), mdxCardApi]);
};
