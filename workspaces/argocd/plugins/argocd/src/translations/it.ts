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
    'appStatus.appHealthStatus.Healthy': 'Integra',
    'appStatus.appHealthStatus.Suspended': 'Sospesa',
    'appStatus.appHealthStatus.Degraded': 'Degradata',
    'appStatus.appHealthStatus.Progressing': 'In progresso',
    'appStatus.appHealthStatus.Missing': 'Mancante',
    'appStatus.appHealthStatus.Unknown': 'Sconosciuto',
    'appStatus.appSyncStatus.Unknown': 'Sconosciuto',
    'appStatus.appSyncStatus.Synced': 'Sincronizzata',
    'appStatus.appSyncStatus.OutOfSync': 'Non sincronizzata',
    'common.appServer.title':
      'Questo è il cluster locale in cui è installato Argo CD.',
    'common.permissionAlert.alertTitle': 'Autorizzazione obbligatoria',
    'common.permissionAlert.alertText': "Per visualizzare il plugin argocd, contatta il tuo amministratore affinché ti assegni l'autorizzazione argocd.view.read.",
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.name': 'Nome',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.kind': 'Tipo',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.createdAt': 'Creato il',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.syncStatus': 'Stato di sincronizzazione',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.healthStatus': 'Stato di salute',
    'deploymentLifecycle.sidebar.resources.resourcesTable.ariaLabelledBy':
      'Risorse',
    'deploymentLifecycle.sidebar.resources.resourcesTable.noneFound':
      'Nessuna risorsa trovata',
    'deploymentLifecycle.sidebar.resources.resourcesTableRow.ariaLabel':
      'espandi riga',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistory.bodyText': 'Cronologia deployment',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistoryCommit.deployedText': 'deployment effettuato',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.title':
      'Immagini',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.tooltipText': "Queste sono le immagini di tutti i deployment nell'applicazione ArgoCD.",
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.namespace': 'Namespace',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.commit':
      'Commit',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.namespace': 'Namespace',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.strategy':
      'Strategia',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.status':
      'Stato',
    'deploymentLifecycle.sidebar.resources.resource.resourceMetadata.namespace': 'Namespace',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.iconButton.ariaLabel':
      'altro',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.refresh':
      'Aggiorna',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.sync': 'Sincronizza',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.placeholder':
      'Cerca per tipo',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.ariaLabel':
      'cancella ricerca',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SearchByName':
      'Nome',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Kind':
      'Tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SyncStatus': 'Stato di sincronizzazione',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.HealthStatus': 'Stato di salute',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Unset':
      'Filtra per',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.searchByNameInput':
      'Cerca per nome',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusInput': 'Filtra per stato di salute',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusInput': 'Filtra per stato di sincronizzazione',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.kindInput':
      'Filtra per tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.resourceFilters': 'Filtri risorse',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.syncStatus': 'Stato di sincronizzazione',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.kind':
      'Tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Healthy': 'Integra',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Suspended': 'Sospesa',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Degraded': 'Degradata',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Progressing': 'In progresso',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Missing':
      'Mancante',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Unknown':
      'Sconosciuto',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Synced': 'Sincronizzata',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Unknown':
      'Sconosciuto',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.OutOfSync': 'Non sincronizzata',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.textPrimary': 'Esecuzione delle analisi',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.name':
      'Nome:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.createdAt': 'Creato il:',
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
    'deploymentLifecycle.deploymentLifecycle.title': 'Ciclo di vita del deployment',
    'deploymentLifecycle.deploymentLifecycle.subtitle': 'Esamina i componenti/sistemi di cui è stato effettuato il deployment nel namespace utilizzando il plugin ArgoCD',
    'deploymentLifecycle.deploymentLifecycleHeader.openInArgoCD':
      'Apri {{appName}} in ArgoCD',
    'deploymentLifecycle.deploymentLifecycleCard.instance': 'Instanza',
    'deploymentLifecycle.deploymentLifecycleCard.server': 'Server',
    'deploymentLifecycle.deploymentLifecycleCard.namespace': 'Namespace',
    'deploymentLifecycle.deploymentLifecycleCard.commit': 'Commit',
    'deploymentLifecycle.deploymentLifecycleCard.tooltipText': "L'SHA del commit mostrato di seguito è l'ultimo commit della prima origine dell'applicazione definita.",
    'deploymentLifecycle.deploymentLifecycleCard.resources': 'Risorse',
    'deploymentLifecycle.deploymentLifecycleCard.resourcesDeployed': 'risorse di cui è stato eseguito il deployment',
    'deploymentLifecycle.deploymentLifecycleDrawer.iconButtonTitle': 'Chiudi il cassetto',
    'deploymentLifecycle.deploymentLifecycleDrawer.instance': 'Instanza',
    'deploymentLifecycle.deploymentLifecycleDrawer.cluster': 'Cluster',
    'deploymentLifecycle.deploymentLifecycleDrawer.namespace': 'Namespace',
    'deploymentLifecycle.deploymentLifecycleDrawer.commit': 'Commit',
    'deploymentLifecycle.deploymentLifecycleDrawer.revision': 'Revisione',
    'deploymentLifecycle.deploymentLifecycleDrawer.resources': 'Risorse',
    'deploymentLifecycle.deploymentLifecycleDrawer.instanceDefaultValue':
      'predefinito',
    'deploymentSummary.deploymentSummary.tableTitle': 'Riepilogo del deployment',
    'deploymentSummary.deploymentSummary.columns.application': 'Applicazione',
    'deploymentSummary.deploymentSummary.columns.namespace': 'Namespace',
    'deploymentSummary.deploymentSummary.columns.instance': 'Instanza',
    'deploymentSummary.deploymentSummary.columns.server': 'Server',
    'deploymentSummary.deploymentSummary.columns.revision': 'Revisione',
    'deploymentSummary.deploymentSummary.columns.lastDeployed': 'Ultimo deployment',
    'deploymentSummary.deploymentSummary.columns.syncStatus': 'Stato di sincronizzazione',
    'deploymentSummary.deploymentSummary.columns.healthStatus': 'Stato di salute',
  },
});

export default argocdTranslationIt;
