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
 * Italian translation for plugin.argocd.
 * @public
 */
const argocdTranslationIt = createTranslationMessages({
  ref: argocdTranslationRef,
  messages: {
    'appStatus.appHealthStatus.Healthy': 'Integro',
    'appStatus.appHealthStatus.Suspended': 'Sospeso',
    'appStatus.appHealthStatus.Degraded': 'Degradato',
    'appStatus.appHealthStatus.Progressing': 'In avanzamento',
    'appStatus.appHealthStatus.Missing': 'Mancante',
    'appStatus.appHealthStatus.Unknown': 'Sconosciuto',
    'appStatus.appSyncStatus.Unknown': 'Sconosciuto',
    'appStatus.appSyncStatus.Synced': 'Sincronizzato',
    'appStatus.appSyncStatus.OutOfSync': 'Non sincronizzato',
    'common.appServer.title':
      'Questo è il cluster locale in cui è installato Argo CD.',
    'common.permissionAlert.alertTitle': 'Autorizzazione richiesta',
    'common.permissionAlert.alertText':
      "Per visualizzare il plugin argocd, contattare l'amministratore per ottenere l'autorizzazione argocd.view.read.",
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.name': 'Nome',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.kind': 'Tipo',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.createdAt':
      'Creato alle',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.syncStatus':
      'Stato della sincronizzazione',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.healthStatus':
      'Stato di integrità',
    'deploymentLifecycle.sidebar.resources.resourcesTable.ariaLabelledBy':
      'Risorse',
    'deploymentLifecycle.sidebar.resources.resourcesTable.noneFound':
      'Nessuna risorsa trovata',
    'deploymentLifecycle.sidebar.resources.resourcesTableRow.ariaLabel':
      'espandi riga',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistory.bodyText':
      'Cronologia delle distribuzioni',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistoryCommit.deployedText':
      'distribuito',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.title':
      'Immagini',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.tooltipText':
      "Queste sono le immagini per tutte le distribuzioni nell'applicazione ArgoCD.",
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.namespace':
      'Spazio dei nomi',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.commit':
      'Commit',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.namespace':
      'Spazio dei nomi',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.strategy':
      'Strategia',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.status':
      'Stato',
    'deploymentLifecycle.sidebar.resources.resource.resourceMetadata.namespace':
      'Spazio dei nomi',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.iconButton.ariaLabel':
      'altro',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.refresh':
      'Aggiorna',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.sync':
      'Sincronizzazione',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.placeholder':
      'Cerca per tipo',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.ariaLabel':
      'cancella ricerca',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SearchByName':
      'Nome',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Kind':
      'Tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SyncStatus':
      'Stato della sincronizzazione',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.HealthStatus':
      'Stato di integrità',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Unset':
      'Filtra per',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.searchByNameInput':
      'Cerca per nome',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusInput':
      'Filtra per Stato di integrità',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusInput':
      'Filtra per stato della sincronizzazione',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.kindInput':
      'Filtra per tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.resourceFilters':
      'Filtri delle risorse',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.syncStatus':
      'Stato della sincronizzazione',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.kind':
      'Tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Healthy':
      'Integro',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Suspended':
      'Sospeso',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Degraded':
      'Degradato',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Progressing':
      'In avanzamento',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Missing':
      'Mancante',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Unknown':
      'Sconosciuto',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Synced':
      'Sincronizzato',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Unknown':
      'Sconosciuto',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.OutOfSync':
      'Non sincronizzato',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.textPrimary':
      'Cicli di analisi',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.name':
      'Nome:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.createdAt':
      'Creato alle:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.status':
      'Stato:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.chipLabel':
      'Analisi',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.revision':
      'Revisione',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.stable':
      'Stabile',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.active':
      'Attivo',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.preview':
      'Anteprima',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revision':
      'Revisione',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.stable':
      'Stabile',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.canary':
      'Canary',
    'deploymentLifecycle.sidebar.rollouts.revisions.revisionImage.textPrimary':
      "Traffico verso l'immagine",
    'deploymentLifecycle.sidebar.rollouts.rollOut.title': 'Revisioni',
    'deploymentLifecycle.deploymentLifecycle.title':
      'Ciclo di vita della distribuzione',
    'deploymentLifecycle.deploymentLifecycle.subtitle':
      'Esaminare i componenti/sistemi distribuiti nello spazio dei nomi utilizzando il plug-in ArgoCD',
    'deploymentLifecycle.deploymentLifecycleCard.instance': 'Istanza',
    'deploymentLifecycle.deploymentLifecycleCard.server': 'Server',
    'deploymentLifecycle.deploymentLifecycleCard.namespace': 'Spazio dei nomi',
    'deploymentLifecycle.deploymentLifecycleCard.commit': 'Commit',
    'deploymentLifecycle.deploymentLifecycleCard.tooltipText':
      "Il commit SHA mostrato di seguito è l'ultimo commit dalla prima sorgente dell'applicazione definita.",
    'deploymentLifecycle.deploymentLifecycleCard.resources': 'Risorse',
    'deploymentLifecycle.deploymentLifecycleCard.resourcesDeployed':
      'risorse distribuite',
    'deploymentLifecycle.deploymentLifecycleDrawer.iconButtonTitle':
      'Chiudi il riquadro',
    'deploymentLifecycle.deploymentLifecycleDrawer.instance': 'Istanza',
    'deploymentLifecycle.deploymentLifecycleDrawer.cluster': 'Cluster',
    'deploymentLifecycle.deploymentLifecycleDrawer.namespace':
      'Spazio dei nomi',
    'deploymentLifecycle.deploymentLifecycleDrawer.commit': 'Commit',
    'deploymentLifecycle.deploymentLifecycleDrawer.revision': 'Revisione',
    'deploymentLifecycle.deploymentLifecycleDrawer.resources': 'Risorse',
    'deploymentLifecycle.deploymentLifecycleDrawer.instanceDefaultValue':
      'predefinito',
    'deploymentSummary.deploymentSummary.tableTitle':
      'Riepilogo della distribuzione',
    'deploymentSummary.deploymentSummary.columns.application': 'Applicazione',
    'deploymentSummary.deploymentSummary.columns.namespace': 'Spazio dei nomi',
    'deploymentSummary.deploymentSummary.columns.instance': 'Istanza',
    'deploymentSummary.deploymentSummary.columns.server': 'Server',
    'deploymentSummary.deploymentSummary.columns.revision': 'Revisione',
    'deploymentSummary.deploymentSummary.columns.lastDeployed':
      'Ultima distribuzione',
    'deploymentSummary.deploymentSummary.columns.syncStatus':
      'Stato della sincronizzazione',
    'deploymentSummary.deploymentSummary.columns.healthStatus':
      'Stato di integrità',
  },
});

export default argocdTranslationIt;
