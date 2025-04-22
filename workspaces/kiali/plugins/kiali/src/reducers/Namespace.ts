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
import type { Namespace } from '@backstage-community/plugin-kiali-common/types';
import { getType } from 'typesafe-actions';
import { KialiAppAction } from '../actions/KialiAppAction';
import { NamespaceActions } from '../actions/NamespaceAction';
import { NamespaceState } from '../store/Store';
import { updateState } from '../utils/Reducer';

function filterDuplicateNamespaces(namespaces: Namespace[]): Namespace[] {
  const nsMap = new Map<string, Namespace>();
  namespaces.forEach(ns => nsMap.set(ns.name, ns));
  return Array.from(nsMap.values());
}

function namespacesPerCluster(namespaces: Namespace[]): Map<string, string[]> {
  const clusterMap: Map<string, string[]> = new Map<string, string[]>();
  namespaces.forEach(namespace => {
    const cluster = namespace.cluster;
    if (cluster) {
      const existingValue = clusterMap.get(cluster) || [];
      clusterMap.set(cluster, existingValue.concat(namespace.name));
    }
  });
  return clusterMap;
}

export const INITIAL_NAMESPACE_STATE: NamespaceState = {
  activeNamespaces: [],
  isFetching: false,
  items: [],
  lastUpdated: undefined,
  filter: '',
};

export const NamespaceStateReducer = (
  state: NamespaceState = INITIAL_NAMESPACE_STATE,
  action: KialiAppAction,
): NamespaceState => {
  switch (action.type) {
    case getType(NamespaceActions.toggleActiveNamespace): {
      const namespaceIndex = state.activeNamespaces.findIndex(
        namespace => namespace.name === action.payload.name,
      );
      if (namespaceIndex === -1) {
        return updateState(state, {
          activeNamespaces: [
            ...state.activeNamespaces,
            { name: action.payload.name },
          ],
        });
      }
      const activeNamespaces = [...state.activeNamespaces];
      activeNamespaces.splice(namespaceIndex, 1);
      return updateState(state, { activeNamespaces });
    }

    case getType(NamespaceActions.setActiveNamespaces):
      return updateState(state, {
        activeNamespaces: filterDuplicateNamespaces(action.payload),
      });

    case getType(NamespaceActions.setFilter):
      return updateState(state, { filter: action.payload });

    case getType(NamespaceActions.requestStarted):
      return updateState(state, {
        isFetching: true,
      });

    case getType(NamespaceActions.receiveList): {
      const names = action.payload.list.map((ns: Namespace) => ns.name);
      const validActive = state.activeNamespaces.filter(an =>
        names.includes(an.name),
      );
      let updatedActive = {};
      if (state.activeNamespaces.length !== validActive.length) {
        updatedActive = { activeNamespaces: validActive };
      }
      return updateState(state, {
        isFetching: false,
        items: filterDuplicateNamespaces(action.payload.list),
        lastUpdated: action.payload.receivedAt,
        namespacesPerCluster: namespacesPerCluster(action.payload.list),
        ...updatedActive,
      });
    }
    case getType(NamespaceActions.requestFailed):
      return updateState(state, {
        isFetching: false,
      });

    default:
      return state;
  }
};
