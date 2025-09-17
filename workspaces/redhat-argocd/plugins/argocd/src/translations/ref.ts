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
      Healthy: 'Healthy - WORKING',
      Suspended: 'Suspended - WORKING',
      Degraded: 'Degraded - WORKING',
      Progressing: 'Progressing - WORKING',
      Missing: 'Missing - WORKING',
      Unknown: 'Unknown - WORKING',
    },
    appSyncStatus: {
      Unknown: 'Unknown - WORKING',
      Synced: 'Synced - WORKING',
      OutOfSync: 'OutOfSync - WORKING',
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
  deploymentLifecycle: {
    sidebar: {
      resources: {
        resourcesColumnHeader: {
          name: 'Name - WORKING',
          kind: 'Kind - REMOVE',
          createdAt: 'Created at - WORKING',
          syncStatus: 'Sync status - WORKING',
          healthStatus: 'Health status - WORKING',
        },
        resourcesTable: {
          ariaLabelledBy: 'Resources - WORKING',
          noneFound: 'No Resources found - WORKING',
        },
        resource: {
          deploymentHistory: {
            bodyText: 'Deployment History - WORKING',
          },
          deploymentHistoryCommit: {
            deployedText: 'deployed - WORKING',
          },
          deploymentMetadata: {
            metadataItemWithTooltip: {
              title: 'Images - WORKING',
              tooltipText:
                'These are the images for all the deployments in the ArgoCD application. - WORKING',
            },
          },
          rolloutMetadata: {
            strategy: 'Strategy - WORKING',
            status: 'Status - WORKING',
          },
        },
        resourcesKebabMenuOptions: {
          refresh: 'Refresh - WORKING',
          sync: 'Sync - WORKING',
        },
        resourcesSearchBar: {
          placeholder: 'Search by kind - WORKING',
          ariaLabel: 'clear search - WORKING',
        },
        filters: {
          resourcesFilterBy: {
            SearchByName: 'Name - WORKING',
            Kind: 'Kind - REMOVE',
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
      rollouts: {
        revisions: {
          analysisRuns: {
            analysisRuns: {
              textPrimary: 'Analysis Runs - WORKING',
              name: 'Name: - WORKING',
              createdAt: 'Created at: - WORKING',
              status: 'Status: - WORKING',
              chipLabel: 'Analysis - WORKING',
            },
          },
          blueGreenRevision: {
            revision: 'Revision - WORKING',
            stable: 'Stable - WORKING',
            active: 'Active - WORKING',
            preview: 'Preview - WORKING',
          },
          canaryRevision: {
            revision: 'Revision - WORKING',
            revisionType: {
              stable: 'Stable - WORKING',
              canary: 'Canary - WORKING',
            },
          },
          revisionImage: {
            textPrimary: 'Traffic to image - WORKING',
          },
        },
        rollOut: {
          title: 'Revisions - WORKING',
        },
      },
    },
    deploymentLifecycle: {
      title: 'Deployment Lifecycle - WORKING',
      subtitle:
        'Review deployed components/systems in the namespace using ArgoCD plugin - WORKING',
    },
    deploymentLifecycleCard: {
      instance: 'Instance - WORKING',
      server: 'Server - WORKING',
      tooltipText:
        'The commit SHA shown below is the latest commit from the first defined Application source. - WORKING',
      resources: 'Resources - WORKING',
      resourcesDeployed: 'resources deployed - WORKING',
    },
    deploymentLifecycleDrawer: {
      iconButtonTitle: 'Close the drawer - WORKING',
      instance: 'Instance - WORKING',
      revision: 'Revision - WORKING',
      resources: 'Resources - WORKING',
    },
  },
  deploymentSummary: {
    deploymentSummary: {
      tableTitle: 'Deployment Summary - WORKING',
      columns: {
        instance: 'Instance - WORKING',
        server: 'Server - WORKING',
        revision: 'Revision - WORKING',
        lastDeployed: 'Last deployed - WORKING',
        syncStatus: 'Sync status - WORKING',
        healthStatus: 'Health status - WORKING',
      },
    },
  },
};

export const argocdTranslationRef = createTranslationRef({
  id: 'argocd',
  messages: ArgoCDMessages,
});
