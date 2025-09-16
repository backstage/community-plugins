/*
 * Copyright 2025 The Backstage Authors
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
import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * Messages object containing all English translations.
 * This is the main source of truth for translations.
 */
export const ArgoCDMessages = {
  types: {
    resources: {
      filters: {
        Name: 'Name - WORKING',
        kind: 'Kind - WORKING',
        SyncStatus: 'Sync status - WORKING',
        HealthStatus: 'Health status - WORKING',
      },
    },
  },
  common: {
    appServer: {
      title: 'This is the local cluster where Argo CD is installed. - WORKING',
    },
    permissionAlert: {
      alertTitle: 'Permission Required - WORKING',
      alertText:
        'To view argocd plugin, contact your administrator to give you the argocd.view.read permission. - WORKING',
    },
  },
  deploymentLifeCycle: {
    sideBar: {
      resource: {
        columnHeader: {
          name: 'Name - WORKING',
          kind: 'Kind - WORKING',
          createdAt: 'Created at - WORKING',
          syncStatus: 'Sync status - WORKING',
          healthStatus: 'Health status - WORKING',
        },
        table: {
          noneFound: 'No Resources found - WORKING',
        },
        deploymentHistory: {
          bodyText: 'Deployment History - WORKING',
        },
        deploymentHistoryCommit: {
          deployedText: 'deployed - WORKING',
        },
        filterBy: {
          SearchByName: 'Name - WORKING',
          Kind: 'Kind - WORKING',
          SyncStatus: 'Sync status - WORKING',
          HealthStatus: 'Health status - WORKING',
          Unset: 'Filter by - WORKING',
          searchByNameInput: 'Search by name - WORKING',
          healthStatusInput: 'Filter by Health status - WORKING',
          syncStatusInput: 'Filter by Sync status - WORKING',
          kindInput: 'Filter by Kind - WORKING',
          healthStatusSelectOptions: {
            Healthy: 'Healthy - WORKING',
            Suspended: 'Suspended - WORKING',
            Degraded: 'Degraded - WORKING',
            Progressing: 'Progressing - WORKING',
            Missing: 'Missing - WORKING',
            Unknown: 'Unknown - WORKING',
          },
          syncStatusSelectOptions: {
            Synced: 'Synced - WORKING',
            Unknown: 'Unknown - WORKING',
            OutOfSync: 'OutOfSync - WORKING',
          },
        },
      },
    },
  },
};

export const argocdTranslationRef = createTranslationRef({
  id: 'argocd',
  messages: ArgoCDMessages,
});
