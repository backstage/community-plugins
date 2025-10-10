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
import { SortField } from '@backstage-community/plugin-kiali-common/types';
import { serverConfig } from '../../config';
import { NamespaceInfo } from './NamespaceInfo';

export const sortFields: SortField<NamespaceInfo>[] = [
  {
    id: 'namespace',
    title: 'Name',
    isNumeric: false,
    param: 'ns',
    compare: (a: NamespaceInfo, b: NamespaceInfo) =>
      a.name.localeCompare(b.name),
  },
  {
    id: 'health',
    title: 'Health',
    isNumeric: false,
    param: 'h',
    compare: (a: NamespaceInfo, b: NamespaceInfo) => {
      if (a.status && b.status) {
        let diff = b.status.inError.length - a.status.inError.length;
        if (diff !== 0) {
          return diff;
        }
        diff = b.status.inWarning.length - a.status.inWarning.length;
        if (diff !== 0) {
          return diff;
        }
      } else if (a.status) {
        return -1;
      } else if (b.status) {
        return 1;
      }
      // default comparison fallback
      return a.name.localeCompare(b.name);
    },
  },
  {
    id: 'mtls',
    title: 'mTLS',
    isNumeric: false,
    param: 'm',
    compare: (a: NamespaceInfo, b: NamespaceInfo) => {
      if (a.tlsStatus && b.tlsStatus) {
        return a.tlsStatus.status.localeCompare(b.tlsStatus.status);
      } else if (a.tlsStatus) {
        return -1;
      } else if (b.tlsStatus) {
        return 1;
      }

      // default comparison fallback
      return a.name.localeCompare(b.name);
    },
  },
  {
    id: 'config',
    title: 'Istio Config',
    isNumeric: false,
    param: 'ic',
    compare: (a: NamespaceInfo, b: NamespaceInfo) => {
      if (a.validations && b.validations) {
        if (a.validations.errors === b.validations.errors) {
          if (a.validations.warnings === b.validations.warnings) {
            if (a.validations.objectCount && b.validations.objectCount) {
              if (a.validations.objectCount === b.validations.objectCount) {
                // If all equal, use name for sorting
                return a.name.localeCompare(b.name);
              }
              return a.validations.objectCount > b.validations.objectCount
                ? -1
                : 1;
            } else if (a.validations.objectCount) {
              return -1;
            } else if (b.validations.objectCount) {
              return 1;
            }
          } else {
            return a.validations.warnings > b.validations.warnings ? -1 : 1;
          }
        } else {
          return a.validations.errors > b.validations.errors ? -1 : 1;
        }
      } else if (a.validations) {
        return -1;
      } else if (b.validations) {
        return 1;
      }

      // default comparison fallback
      return a.name.localeCompare(b.name);
    },
  },
  {
    id: 'cluster',
    title: 'Cluster',
    isNumeric: false,
    param: 'cl',
    compare: (a: NamespaceInfo, b: NamespaceInfo) => {
      if (a.cluster && b.cluster) {
        let sortValue = a.cluster.localeCompare(b.cluster);
        if (sortValue === 0) {
          sortValue = a.name.localeCompare(b.name);
        }
        return sortValue;
      }
      return 0;
    },
  },
];

export const sortFunc = (
  allNamespaces: NamespaceInfo[],
  sortField: SortField<NamespaceInfo>,
  isAscending: boolean,
) => {
  // Add check for serverConfig
  if (!serverConfig || !serverConfig.istioNamespace) {
    return allNamespaces.sort(
      isAscending ? sortField.compare : (a, b) => sortField.compare(b, a),
    );
  }

  const sortedNamespaces = allNamespaces
    .filter(ns => ns.name !== serverConfig.istioNamespace)
    .sort(isAscending ? sortField.compare : (a, b) => sortField.compare(b, a));

  return allNamespaces
    .filter(ns => ns.name === serverConfig.istioNamespace)
    .concat(sortedNamespaces);
};
