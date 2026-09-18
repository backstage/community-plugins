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

import type { Entity } from '@backstage/catalog-model';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import type { PermissionApi } from '@backstage/plugin-permission-react';

import {
  mockArgoMultiInstanceAppNameEntity,
  mockArgoMultiInstanceSelectorEntity,
  mockArgoOneAppEntity,
  mockEntity,
} from './__data__';

export const permissionDeniedMockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'permission-denied',
    description: 'Entity for testing Argo CD permissions',
    annotations: {
      'argocd/app-selector':
        'rht-gitops.com/janus-argocd=quarkus-app-bootstrap',
      'argocd/project-name': 'project-name',
      'argocd/instance-name': 'main',
      'backstage.io/kubernetes-id': 'quarkus-app',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export const mockCatalogApi = catalogApiMock({
  entities: [
    mockEntity,
    permissionDeniedMockEntity,
    mockArgoMultiInstanceSelectorEntity,
    mockArgoMultiInstanceAppNameEntity,
    mockArgoOneAppEntity,
  ],
});

const MOCK_ARGOCD_FINALIZED_MODE_KEY = 'argocd-mock-permissions-finalized-mode';

const argocdViewReadPermissionName = 'argocd.view.read';

type MockArgocdPermissionsMode = 'allow' | 'deny';

function isPermissionDeniedEntityPath(pathname: string): boolean {
  return /\/component\/permission-denied(?:\/|$)/.test(pathname);
}

function getDesiredMockArgocdPermissionsModeFromPathname(
  pathname: string,
): MockArgocdPermissionsMode | undefined {
  if (isPermissionDeniedEntityPath(pathname)) {
    return 'deny';
  }

  if (/\/component\/backstage(?:\/|$)/.test(pathname)) {
    return 'allow';
  }

  return undefined;
}

/**
 * NFS extension `if` predicates are session-scoped. Reload when navigating
 * between the mock `backstage` and `permission-denied` catalog entities so
 * permission checks run again and Argo CD tabs are shown or hidden correctly.
 */
export function installMockArgocdPermissionsPathSync(): void {
  const sync = () => {
    const desiredMode = getDesiredMockArgocdPermissionsModeFromPathname(
      window.location.pathname,
    );

    if (!desiredMode) {
      return;
    }

    const lastFinalizedMode = sessionStorage.getItem(
      MOCK_ARGOCD_FINALIZED_MODE_KEY,
    );

    if (lastFinalizedMode === desiredMode) {
      return;
    }

    sessionStorage.setItem(MOCK_ARGOCD_FINALIZED_MODE_KEY, desiredMode);
    window.location.reload();
  };

  sync();

  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    originalPushState(...args);
    sync();
  };

  history.replaceState = (...args) => {
    originalReplaceState(...args);
    sync();
  };

  window.addEventListener('popstate', sync);
}

/**
 * Mock PermissionApi used by the NFS dev app. The mocked catalog includes
 * `backstage` (allowed) and `permission-denied` (denied) entities; argocd
 * view read permission is denied when viewing the permission-denied entity.
 */
export function createMockPermissionApi(): PermissionApi {
  return {
    authorize: async request => {
      if (
        request.permission.name === argocdViewReadPermissionName &&
        isPermissionDeniedEntityPath(window.location.pathname)
      ) {
        return { result: AuthorizeResult.DENY };
      }

      return { result: AuthorizeResult.ALLOW };
    },
  };
}
