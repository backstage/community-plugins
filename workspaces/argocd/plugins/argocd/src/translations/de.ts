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

import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';
import { argocdTranslationRef } from './ref';

/**
 * de translation for plugin.argocd.
 * @public
 */
const argocdTranslationDe = createTranslationMessages({
  ref: argocdTranslationRef,
  messages: {
    'appStatus.appHealthStatus.Healthy': 'Fehlerfrei',
    'appStatus.appHealthStatus.Suspended': 'Ausgesetzt',
    'appStatus.appHealthStatus.Degraded': 'Heruntergestuft',
    'appStatus.appHealthStatus.Progressing': 'Wird verarbeitet',
    'appStatus.appHealthStatus.Missing': 'Fehlen',
    'appStatus.appHealthStatus.Unknown': 'Unbekannt',
    'appStatus.appSyncStatus.Unknown': 'Unbekannt',
    'appStatus.appSyncStatus.Synced': 'Synchronisiert',
    'appStatus.appSyncStatus.OutOfSync': 'OutOfSync',
    'common.appServer.title':
      'Dies ist der lokale Cluster, auf dem Argo CD installiert ist.',
    'common.permissionAlert.alertTitle': 'Berechtigung erforderlich',
    'common.permissionAlert.alertText': 'Um das argocd-Plugin anzuzeigen, wenden Sie sich an Ihren Administrator, um die Berechtigung „argocd.view.read“ zu erhalten.',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.name': 'Name',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.kind': 'Art',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.createdAt':
      'Erstellt um',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.syncStatus':
      'Synchronisierungsstatus',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.healthStatus':
      'Integritätsstatus',
    'deploymentLifecycle.sidebar.resources.resourcesTable.ariaLabelledBy':
      'Ressourcen',
    'deploymentLifecycle.sidebar.resources.resourcesTable.noneFound':
      'Keine Ressourcen gefunden',
    'deploymentLifecycle.sidebar.resources.resourcesTableRow.ariaLabel': 'Zeile einblenden',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistory.bodyText':
      'Deployment-Verlauf',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistoryCommit.deployedText':
      'deployt',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.title':
      'Images',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.tooltipText': 'Dies sind die Images für alle Deployments in der ArgoCD-Anwendung.',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.namespace':
      'Namespace',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.commit': 'Committen',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.namespace':
      'Namespace',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.strategy':
      'Strategie',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.status':
      'Status',
    'deploymentLifecycle.sidebar.resources.resource.resourceMetadata.namespace':
      'Namespace',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.iconButton.ariaLabel':
      'mehr',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.refresh':
      'Aktualisieren',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.sync':
      'Synchronisieren',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.placeholder':
      'Suchen nach Art',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.ariaLabel':
      'Suche löschen',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SearchByName':
      'Name',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Kind':
      'Art',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SyncStatus':
      'Synchronisierungsstatus',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.HealthStatus':
      'Integritätsstatus',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Unset':
      'Filtern nach',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.searchByNameInput': 'Suchen nach Namen',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusInput': 'Nach Integritätsstatus filtern',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusInput': 'Nach Synchronisierungsstatus filtern',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.kindInput': 'Nach Art filtern',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.resourceFilters':
      'Ressourcenfilter',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.syncStatus':
      'Synchronisierungsstatus',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.kind':
      'Art',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Healthy':
      'Fehlerfrei',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Suspended':
      'Ausgesetzt',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Degraded': 'Heruntergestuft',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Progressing':
      'Wird verarbeitet',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Missing': 'Fehlen',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Unknown':
      'Unbekannt',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Synced':
      'Synchronisiert',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Unknown':
      'Unbekannt',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.OutOfSync':
      'OutOfSync',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.textPrimary': 'Analyseausführungen',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.name':
      'Name:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.createdAt':
      'Erstellt um:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.status':
      'Status:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.chipLabel':
      'Analyse',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.revision':
      'Revision',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.stable':
      'Stabil',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.active':
      'Aktiv',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.preview':
      'Vorschau',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revision':
      'Revision',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.stable':
      'Stabil',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.canary':
      'Canary',
    'deploymentLifecycle.sidebar.rollouts.revisions.revisionImage.textPrimary':
      'Datenverkehr zum Image',
    'deploymentLifecycle.sidebar.rollouts.rollOut.title': 'Revisionen',
    'deploymentLifecycle.deploymentLifecycle.title': 'Deployment-Lebenszyklus',
    'deploymentLifecycle.deploymentLifecycle.subtitle': 'Überprüfen Sie die deployten Komponenten/Systeme im Namespace mithilfe des ArgoCD-Plugins',
    'deploymentLifecycle.deploymentLifecycleHeader.openInArgoCD':
      '{{appName}} in ArgoCD öffnen',
    'deploymentLifecycle.deploymentLifecycleCard.instance': 'Instanz',
    'deploymentLifecycle.deploymentLifecycleCard.server': 'Server',
    'deploymentLifecycle.deploymentLifecycleCard.namespace': 'Namespace',
    'deploymentLifecycle.deploymentLifecycleCard.commit': 'Committen',
    'deploymentLifecycle.deploymentLifecycleCard.tooltipText': 'Der unten gezeigte Commit-SHA ist der letzte Commit aus der ersten definierten Anwendungsquelle.',
    'deploymentLifecycle.deploymentLifecycleCard.resources': 'Ressourcen',
    'deploymentLifecycle.deploymentLifecycleCard.resourcesDeployed': 'Ressourcen deployt',
    'deploymentLifecycle.deploymentLifecycleDrawer.iconButtonTitle': 'Leiste schließen',
    'deploymentLifecycle.deploymentLifecycleDrawer.instance': 'Instanz',
    'deploymentLifecycle.deploymentLifecycleDrawer.cluster': 'Cluster',
    'deploymentLifecycle.deploymentLifecycleDrawer.namespace': 'Namespace',
    'deploymentLifecycle.deploymentLifecycleDrawer.commit': 'Committen',
    'deploymentLifecycle.deploymentLifecycleDrawer.revision': 'Revision',
    'deploymentLifecycle.deploymentLifecycleDrawer.resources': 'Ressourcen',
    'deploymentLifecycle.deploymentLifecycleDrawer.instanceDefaultValue':
      'Standard',
    'deploymentSummary.deploymentSummary.tableTitle': 'Deployment-Übersicht',
    'deploymentSummary.deploymentSummary.columns.application': 'Anwendung',
    'deploymentSummary.deploymentSummary.columns.namespace': 'Namespace',
    'deploymentSummary.deploymentSummary.columns.instance': 'Instanz',
    'deploymentSummary.deploymentSummary.columns.server': 'Server',
    'deploymentSummary.deploymentSummary.columns.revision': 'Revision',
    'deploymentSummary.deploymentSummary.columns.lastDeployed':
      'Zuletzt deployt',
    'deploymentSummary.deploymentSummary.columns.syncStatus':
      'Synchronisierungsstatus',
    'deploymentSummary.deploymentSummary.columns.healthStatus':
      'Integritätsstatus',
  },
});

export default argocdTranslationDe;
