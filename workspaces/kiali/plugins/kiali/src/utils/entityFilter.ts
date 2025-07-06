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
  KIALI_APP,
  KIALI_LABEL_SELECTOR_QUERY_ANNOTATION,
  KIALI_NAMESPACE,
} from '@backstage-community/plugin-kiali-common';
import type { Namespace } from '@backstage-community/plugin-kiali-common/types';

const filterById = (ns: Namespace[], value: string): Namespace[] => {
  const values = value.split(',');
  return ns.filter(n => n.labels && values.includes(n.labels[KIALI_APP]));
};

const filterBySelector = (ns: Namespace[], value: string): Namespace[] => {
  const values = value.split(',');
  return ns.filter(
    n =>
      values.filter(v => {
        const [key, valueLabel] = v.split('=');
        return n.labels && n.labels[key] === valueLabel;
      }).length > 0,
  );
};

const filterByNs = (ns: Namespace[], value: string): Namespace[] => {
  const values = value.split(',');
  return ns.filter(n => values.includes(n.name));
};

export const filterNsByAnnotation = (
  ns: Namespace[],
  annotations: Record<string, string>,
): Namespace[] => {
  if (!annotations) {
    return [];
  }

  let nsFilter = ns;
  nsFilter = annotations[KIALI_APP]
    ? filterById(nsFilter, decodeURIComponent(annotations[KIALI_APP]))
    : nsFilter;
  nsFilter = annotations[KIALI_LABEL_SELECTOR_QUERY_ANNOTATION]
    ? filterBySelector(
        nsFilter,
        decodeURIComponent(annotations[KIALI_LABEL_SELECTOR_QUERY_ANNOTATION]),
      )
    : nsFilter;
  nsFilter = annotations[KIALI_NAMESPACE]
    ? filterByNs(nsFilter, decodeURIComponent(annotations[KIALI_NAMESPACE]))
    : nsFilter;
  return nsFilter;
};

export const exportedForTesting = {
  filterById,
  filterBySelector,
  filterByNs,
};
