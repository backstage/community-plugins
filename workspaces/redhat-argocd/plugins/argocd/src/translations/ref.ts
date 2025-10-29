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
  appStatus: {
    appHealthStatus: {
      Healthy: 'Healthy',
      Suspended: 'Suspended',
      Degraded: 'Degraded',
      Progressing: 'Progressing',
      Missing: 'Missing',
      Unknown: 'Unknown',
    },
    appSyncStatus: {
      Unknown: 'Unknown',
      Synced: 'Synced',
      OutOfSync: 'OutOfSync',
    },
  },
  common: {
    appServer: {
      title: 'This is the local cluster where Argo CD is installed.',
    },
    permissionAlert: {
      alertTitle: 'Permission Required',
      alertText:
        'To view argocd plugin, contact your administrator to give you the argocd.view.read permission.',
    },
  },
  deploymentLifecycle: {
    sidebar: {
      resources: {
        resourcesColumnHeader: {
          name: 'Name',
          kind: 'Kind',
          createdAt: 'Created at',
          syncStatus: 'Sync status',
          healthStatus: 'Health status',
        },
        resourcesTable: {
          ariaLabelledBy: 'Resources',
          noneFound: 'No Resources found',
        },
        resourcesTableRow: {
          ariaLabel: 'expand row',
        },
        resource: {
          deploymentHistory: {
            bodyText: 'Deployment history',
          },
          deploymentHistoryCommit: {
            deployedText: 'deployed',
          },
          deploymentMetadata: {
            metadataItemWithTooltip: {
              title: 'Images',
              tooltipText:
                'These are the images for all the deployments in the ArgoCD application.',
            },
            namespace: 'Namespace',
            commit: 'Commit',
          },
          rolloutMetadata: {
            namespace: 'Namespace',
            strategy: 'Strategy',
            status: 'Status',
          },
          resourceMetadata: {
            namespace: 'Namespace',
          },
        },
        resourcesKebabMenuOptions: {
          iconButton: {
            ariaLabel: 'more',
          },
          refresh: 'Refresh',
          sync: 'Sync',
        },
        resourcesSearchBar: {
          placeholder: 'Search by kind',
          ariaLabel: 'clear search',
        },
        filters: {
          resourcesFilterBy: {
            SearchByName: 'Name',
            Kind: 'Kind',
            SyncStatus: 'Sync status',
            HealthStatus: 'Health status',
            Unset: 'Filter by',
            searchByNameInput: 'Search by name',
            healthStatusInput: 'Filter by Health status',
            syncStatusInput: 'Filter by Sync status',
            kindInput: 'Filter by Kind',
            ariaLabels: {
              resourceFilters: 'Resource Filters',
              syncStatus: 'Sync status',
              kind: 'Kind',
            },
            healthStatusSelectOptions: {
              Healthy: 'Healthy',
              Suspended: 'Suspended',
              Degraded: 'Degraded',
              Progressing: 'Progressing',
              Missing: 'Missing',
              Unknown: 'Unknown',
            },
            syncStatusSelectOptions: {
              Synced: 'Synced',
              Unknown: 'Unknown',
              OutOfSync: 'OutOfSync',
            },
          },
        },
      },
      rollouts: {
        revisions: {
          analysisRuns: {
            analysisRuns: {
              textPrimary: 'Analysis Runs',
              name: 'Name:',
              createdAt: 'Created at:',
              status: 'Status:',
              chipLabel: 'Analysis',
            },
          },
          blueGreenRevision: {
            revision: 'Revision',
            stable: 'Stable',
            active: 'Active',
            preview: 'Preview',
          },
          canaryRevision: {
            revision: 'Revision',
            revisionType: {
              stable: 'Stable',
              canary: 'Canary',
            },
          },
          revisionImage: {
            textPrimary: 'Traffic to image',
          },
        },
        rollOut: {
          title: 'Revisions',
        },
      },
    },
    deploymentLifecycle: {
      title: 'Deployment lifecycle',
      subtitle:
        'Review deployed components/systems in the namespace using ArgoCD plugin',
    },
    deploymentLifecycleCard: {
      instance: 'Instance',
      server: 'Server',
      namespace: 'Namespace',
      commit: 'Commit',
      tooltipText:
        'The commit SHA shown below is the latest commit from the first defined Application source.',
      resources: 'Resources',
      resourcesDeployed: 'resources deployed',
    },
    deploymentLifecycleDrawer: {
      iconButtonTitle: 'Close the drawer',
      instance: 'Instance',
      cluster: 'Cluster',
      namespace: 'Namespace',
      commit: 'Commit',
      revision: 'Revision',
      resources: 'Resources',
      instanceDefaultValue: 'default',
    },
  },
  deploymentSummary: {
    deploymentSummary: {
      tableTitle: 'Deployment Summary',
      columns: {
        instance: 'Instance',
        server: 'Server',
        revision: 'Revision',
        lastDeployed: 'Last deployed',
        syncStatus: 'Sync status',
        healthStatus: 'Health status',
      },
    },
  },
};

/**
 * Translation reference for ArgoCD plugin
 * @alpha
 */
export const argocdTranslationRef = createTranslationRef({
  id: 'plugin.argocd',
  messages: ArgoCDMessages,
});
