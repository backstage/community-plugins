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
 * fr translation for plugin.argocd.
 * @public
 */
const argocdTranslationFr = createTranslationMessages({
  ref: argocdTranslationRef,
  messages: {
    'appStatus.appHealthStatus.Healthy': 'En bon fonctionnement',
    'appStatus.appHealthStatus.Suspended': 'Suspendu',
    'appStatus.appHealthStatus.Degraded': 'Dégradé',
    'appStatus.appHealthStatus.Progressing': 'Progression',
    'appStatus.appHealthStatus.Missing': 'Manquant',
    'appStatus.appHealthStatus.Unknown': 'Inconnu',
    'appStatus.appSyncStatus.Unknown': 'Inconnu',
    'appStatus.appSyncStatus.Synced': 'Synchronisé',
    'appStatus.appSyncStatus.OutOfSync': 'Désynchronisation',
    'common.appServer.title':
      "Il s'agit du cluster local sur lequel Argo CD est installé.",
    'common.permissionAlert.alertTitle': 'Autorisation requise',
    'common.permissionAlert.alertText':
      "Pour afficher le plugin argocd, contactez votre administrateur pour qu'il vous donne l'autorisation argocd.view.read.",
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.name': 'Nom',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.kind': 'Type',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.createdAt':
      'Créé à',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.syncStatus':
      'Statut de synchronisation',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.healthStatus':
      'État de fonctionnement',
    'deploymentLifecycle.sidebar.resources.resourcesTable.ariaLabelledBy':
      'Ressources',
    'deploymentLifecycle.sidebar.resources.resourcesTable.noneFound':
      'Aucune ressource trouvée',
    'deploymentLifecycle.sidebar.resources.resourcesTableRow.ariaLabel':
      'développer la ligne',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistory.bodyText':
      'Historique de déploiement',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistoryCommit.deployedText':
      'déployé',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.title':
      'Images',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.tooltipText':
      "Voici les images de tous les déploiements dans l'application ArgoCD.",
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.namespace':
      'Espace de noms',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.commit':
      'Valider',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.namespace':
      'Espace de noms',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.strategy':
      'Stratégie',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.status':
      'Statut',
    'deploymentLifecycle.sidebar.resources.resource.resourceMetadata.namespace':
      'Espace de noms',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.iconButton.ariaLabel':
      'davantage',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.refresh':
      'Rafraîchir',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.sync':
      'Synchroniser',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.placeholder':
      'Recherche par type',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.ariaLabel':
      'supprimer la recherche',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SearchByName':
      'Nom',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Kind':
      'Type',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SyncStatus':
      'Statut de synchronisation',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.HealthStatus':
      'État de fonctionnement',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Unset':
      'Filtrer par',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.searchByNameInput':
      'Rechercher par nom',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusInput':
      'Filtrer par état de fonctionnement',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusInput':
      'Filtrer par statut de synchronisation',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.kindInput':
      'Filtrer par type',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.resourceFilters':
      'Filtres de ressources',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.syncStatus':
      'Statut de synchronisation',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.kind':
      'Type',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Healthy':
      'En bon fonctionnement',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Suspended':
      'Suspendu',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Degraded':
      'Dégradé',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Progressing':
      'Progression',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Missing':
      'Manquant',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Unknown':
      'Inconnu',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Synced':
      'Synchronisé',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Unknown':
      'Inconnu',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.OutOfSync':
      'Désynchronisation',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.textPrimary':
      "Exécutions d'analyse",
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.name':
      'Nom:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.createdAt':
      'Créé à :',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.status':
      'Statut:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.chipLabel':
      'Analyse',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.revision':
      'Révision',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.stable':
      'Stable',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.active':
      'Actif',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.preview':
      'Aperçu',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revision':
      'Révision',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.stable':
      'Stable',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.canary':
      'Canary',
    'deploymentLifecycle.sidebar.rollouts.revisions.revisionImage.textPrimary':
      "Trafic vers l'image",
    'deploymentLifecycle.sidebar.rollouts.rollOut.title': 'Révisions',
    'deploymentLifecycle.deploymentLifecycle.title':
      'Cycle de vie du déploiement',
    'deploymentLifecycle.deploymentLifecycle.subtitle':
      "Examiner les composants/systèmes déployés dans l'espace de noms à l'aide du plugin ArgoCD",
    'deploymentLifecycle.deploymentLifecycleCard.instance': 'Exemple',
    'deploymentLifecycle.deploymentLifecycleCard.server': 'Serveur',
    'deploymentLifecycle.deploymentLifecycleCard.namespace': 'Espace de noms',
    'deploymentLifecycle.deploymentLifecycleCard.commit': 'Valider',
    'deploymentLifecycle.deploymentLifecycleCard.tooltipText':
      "Le commit SHA indiqué ci-dessous est le dernier commit de la première source d'application définie.",
    'deploymentLifecycle.deploymentLifecycleCard.resources': 'Ressources',
    'deploymentLifecycle.deploymentLifecycleCard.resourcesDeployed':
      'ressources déployées',
    'deploymentLifecycle.deploymentLifecycleDrawer.iconButtonTitle':
      'Fermez le tiroir',
    'deploymentLifecycle.deploymentLifecycleDrawer.instance': 'Exemple',
    'deploymentLifecycle.deploymentLifecycleDrawer.cluster': 'Cluster',
    'deploymentLifecycle.deploymentLifecycleDrawer.namespace': 'Espace de noms',
    'deploymentLifecycle.deploymentLifecycleDrawer.commit': 'Valider',
    'deploymentLifecycle.deploymentLifecycleDrawer.revision': 'Révision',
    'deploymentLifecycle.deploymentLifecycleDrawer.resources': 'Ressources',
    'deploymentLifecycle.deploymentLifecycleDrawer.instanceDefaultValue':
      'défaut',
    'deploymentSummary.deploymentSummary.tableTitle': 'Résumé du déploiement',
    'deploymentSummary.deploymentSummary.columns.application': 'Application',
    'deploymentSummary.deploymentSummary.columns.namespace': 'Espace de noms',
    'deploymentSummary.deploymentSummary.columns.instance': 'Exemple',
    'deploymentSummary.deploymentSummary.columns.server': 'Serveur',
    'deploymentSummary.deploymentSummary.columns.revision': 'Révision',
    'deploymentSummary.deploymentSummary.columns.lastDeployed':
      'Dernier déploiement',
    'deploymentSummary.deploymentSummary.columns.syncStatus':
      'Statut de synchronisation',
    'deploymentSummary.deploymentSummary.columns.healthStatus':
      'État de fonctionnement',
  },
});

export default argocdTranslationFr;
