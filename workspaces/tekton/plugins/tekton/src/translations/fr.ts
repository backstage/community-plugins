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
import { tektonTranslationRef } from './ref';

/**
 * fr translation for plugin.tekton.
 * @public
 */
const tektonTranslationFr = createTranslationMessages({
  ref: tektonTranslationRef,
  messages: {
    'errorPanel.title':
      'Un problème est survenu lors de la récupération des objets Kubernetes',
    'errorPanel.description':
      "Un problème est survenu lors de la récupération de certaines ressources Kubernetes pour l'entité : {{entityName}}. Cela pourrait signifier que la carte de rapport d’erreur n’est pas complètement précise.",
    'permissionAlert.title': 'Autorisation requise',
    'permissionAlert.description':
      "Pour afficher les exécutions de pipelines Tekton, contactez votre administrateur pour qu'il vous accorde les autorisations suivantes : {{permissions}}.",
    'statusSelector.label': 'Statut',
    'clusterSelector.label': 'Cluster',
    'tableExpandCollapse.collapseAll': 'Tout Réduire',
    'tableExpandCollapse.expandAll': 'Tout Développer',
    'pipelineVisualization.emptyState.description':
      'Aucune exécution de pipeline à visualiser',
    'pipelineVisualization.noTasksDescription':
      "Cette exécution de pipeline n'a aucune tâche à visualiser",
    'pipelineVisualization.stepList.finallyTaskTitle': 'Enfin la tâche',
    'pipelineRunList.title': 'Pipelines',
    'pipelineRunList.noPipelineRuns': 'Aucune exécution de pipeline trouvée',
    'pipelineRunList.searchBarPlaceholder': 'Rechercher',
    'pipelineRunList.rowActions.viewParamsAndResults':
      'Afficher les Paramètres et les Résultats',
    'pipelineRunList.rowActions.viewLogs': 'Afficher les journaux',
    'pipelineRunList.rowActions.unauthorizedViewLogs':
      'Non autorisé à consulter les journaux',
    'pipelineRunList.rowActions.viewSBOM': 'Voir SBOM',
    'pipelineRunList.rowActions.SBOMNotApplicable':
      "La vue SBOM n'est pas applicable pour ce PipelineRun",
    'pipelineRunList.rowActions.viewOutput': 'Afficher la sortie',
    'pipelineRunList.rowActions.outputNotApplicable':
      "La vue de sortie n'est pas applicable pour ce PipelineRun",
    'pipelineRunList.vulnerabilitySeverityTitle.critical': 'Critique',
    'pipelineRunList.vulnerabilitySeverityTitle.high': 'Haut',
    'pipelineRunList.vulnerabilitySeverityTitle.medium': 'Moyen',
    'pipelineRunList.vulnerabilitySeverityTitle.low': 'Faible',
    'pipelineRunList.tableHeaderTitle.name': 'NOM',
    'pipelineRunList.tableHeaderTitle.vulnerabilities': 'VULNÉRABILITÉS',
    'pipelineRunList.tableHeaderTitle.status': 'STATUT',
    'pipelineRunList.tableHeaderTitle.taskStatus': 'STATUT DE LA TÂCHE',
    'pipelineRunList.tableHeaderTitle.startTime': 'COMMENCÉ',
    'pipelineRunList.tableHeaderTitle.duration': 'DURÉE',
    'pipelineRunList.tableHeaderTitle.actions': 'ACTES',
    'pipelineRunList.tablePagination.rowsPerPageOptionLabel': '{{num}} lignes',
    'pipelineRunLogs.title': "Journaux d'exécution de pipeline",
    'pipelineRunLogs.noLogs': 'Aucun journal trouvé',
    'pipelineRunLogs.downloader.downloadTaskLogs': 'Télécharger',
    'pipelineRunLogs.downloader.downloadPipelineRunLogs':
      'Télécharger tous les journaux de tâches',
    'pipelineRunLogs.podLogsDownloadLink.title': 'Télécharger',
    'pipelineRunLogs.podLogsDownloadLink.downloading':
      'téléchargement des journaux',
    'pipelineRunLogs.taskStatusStepper.skipped': 'Ignoré',
    'pipelineRunOutput.title': 'Sortie de PipelineRun',
    'pipelineRunOutput.noOutput': 'Aucune sortie',
    'pipelineRunStatus.All': 'Tous',
    'pipelineRunStatus.Cancelling': 'Annulation',
    'pipelineRunStatus.Succeeded': 'Réussi',
    'pipelineRunStatus.Failed': 'Échoué',
    'pipelineRunStatus.Running': "En cours d'exécution",
    'pipelineRunStatus.In Progress': 'En cours',
    'pipelineRunStatus.FailedToStart': 'Échec du démarrage',
    'pipelineRunStatus.PipelineNotStarted': 'PipelineNotStarted',
    'pipelineRunStatus.Skipped': 'Ignoré',
    'pipelineRunStatus.Cancelled': 'Annulé',
    'pipelineRunStatus.Pending': 'En attente',
    'pipelineRunStatus.Idle': 'Inactif',
    'pipelineRunStatus.Other': 'Autre',
    'pipelineRunDuration.lessThanSec': "moins d'une seconde",
    'pipelineRunDuration.hour_one': '{{count}} heure',
    'pipelineRunDuration.hour_other': '{{count}} heures',
    'pipelineRunDuration.minute_one': '{{count}} minute',
    'pipelineRunDuration.minute_other': '{{count}} minutes',
    'pipelineRunDuration.second_one': '{{count}} seconde',
    'pipelineRunDuration.second_other': '{{count}} secondes',
    'pipelineRunParamsAndResults.title': 'PipelineRun Paramètres et Résultats',
    'pipelineRunParamsAndResults.noParams': 'Aucun paramètre trouvé',
    'pipelineRunParamsAndResults.noResults': 'Aucun résultat trouvé',
    'pipelineRunParamsAndResults.params': 'Paramètres',
    'pipelineRunParamsAndResults.results': 'Résultats',
    'pipelineRunParamsAndResults.outputTableColumn.name': 'Nom',
    'pipelineRunParamsAndResults.outputTableColumn.value': 'Valeur',
  },
});

export default tektonTranslationFr;
