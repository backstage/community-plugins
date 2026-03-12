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
 * Italian translation for plugin.tekton.
 * @public
 */
const tektonTranslationIt = createTranslationMessages({
  ref: tektonTranslationRef,
  messages: {
    'errorPanel.title':
      'Si è verificato un problema durante il recupero degli oggetti Kubernetes',
    'errorPanel.description':
      "Si è verificato un problema durante il recupero di alcune risorse Kubernetes per l'entità: {{entityName}}. Potrebbe significare che la scheda Segnalazione errori non è del tutto precisa.",
    'permissionAlert.title': 'Autorizzazione richiesta',
    'permissionAlert.description':
      "Per visualizzare le esecuzioni delle pipeline Tekton, contattare l'amministratore per ottenere le seguenti autorizzazioni: {{permissions}}.",
    'statusSelector.label': 'Stato',
    'clusterSelector.label': 'Cluster',
    'tableExpandCollapse.collapseAll': 'Comprimi tutto',
    'tableExpandCollapse.expandAll': 'Espandi tutto',
    'pipelineVisualization.emptyState.description':
      'Nessuna esecuzione della pipeline da visualizzare',
    'pipelineVisualization.noTasksDescription':
      'Questa esecuzione della pipeline non ha attività da visualizzare',
    'pipelineVisualization.stepList.finallyTaskTitle': 'Attività finale',
    'pipelineRunList.title': 'Esecuzioni di pipeline',
    'pipelineRunList.noPipelineRuns': 'Nessuna esecuzione di pipeline trovata',
    'pipelineRunList.searchBarPlaceholder': 'Ricerca',
    'pipelineRunList.rowActions.viewParamsAndResults':
      'Visualizza parametri e risultati',
    'pipelineRunList.rowActions.viewLogs': 'Visualizza registri',
    'pipelineRunList.rowActions.unauthorizedViewLogs':
      'Non autorizzato a visualizzare i registri',
    'pipelineRunList.rowActions.viewSBOM': 'Visualizza SBOM',
    'pipelineRunList.rowActions.SBOMNotApplicable':
      'Visualizza SBOM non è applicabile a questa PipelineRun',
    'pipelineRunList.rowActions.viewOutput': 'Visualizza output',
    'pipelineRunList.rowActions.outputNotApplicable':
      'Visualizza output non è applicabile a questa PipelineRun',
    'pipelineRunList.vulnerabilitySeverityTitle.critical': 'Critica',
    'pipelineRunList.vulnerabilitySeverityTitle.high': 'Alta',
    'pipelineRunList.vulnerabilitySeverityTitle.medium': 'Media',
    'pipelineRunList.vulnerabilitySeverityTitle.low': 'Bassa',
    'pipelineRunList.tableHeaderTitle.name': 'NOME',
    'pipelineRunList.tableHeaderTitle.vulnerabilities': 'VULNERABILITÀ',
    'pipelineRunList.tableHeaderTitle.status': 'STATO',
    'pipelineRunList.tableHeaderTitle.taskStatus': "STATO DELL'ATTIVITÀ",
    'pipelineRunList.tableHeaderTitle.startTime': 'Iniziata',
    'pipelineRunList.tableHeaderTitle.duration': 'DURATA',
    'pipelineRunList.tableHeaderTitle.actions': 'AZIONI',
    'pipelineRunList.tablePagination.rowsPerPageOptionLabel': '{{num}} righe',
    'pipelineRunLogs.title': 'Registri PipelineRun',
    'pipelineRunLogs.noLogs': 'Nessun registro trovato',
    'pipelineRunLogs.downloader.downloadTaskLogs': 'Scaricamento',
    'pipelineRunLogs.downloader.downloadPipelineRunLogs':
      'Scarica tutti i registri delle attività',
    'pipelineRunLogs.podLogsDownloadLink.title': 'Scaricamento',
    'pipelineRunLogs.podLogsDownloadLink.downloading':
      'download dei registri in corso',
    'pipelineRunLogs.taskStatusStepper.skipped': 'Ignorato',
    'pipelineRunOutput.title': 'Output di PipelineRun',
    'pipelineRunOutput.noOutput': 'Nessun output',
    'pipelineRunStatus.All': 'Tutto',
    'pipelineRunStatus.Cancelling': 'Annullamento',
    'pipelineRunStatus.Succeeded': 'Riuscito',
    'pipelineRunStatus.Failed': 'Non riuscito',
    'pipelineRunStatus.Running': 'In esecuzione',
    'pipelineRunStatus.In Progress': 'In corso',
    'pipelineRunStatus.FailedToStart': 'Impossibile avviare',
    'pipelineRunStatus.PipelineNotStarted': 'Pipeline non avviata',
    'pipelineRunStatus.Skipped': 'Ignorato',
    'pipelineRunStatus.Cancelled': 'Annullato',
    'pipelineRunStatus.Pending': 'In pausa',
    'pipelineRunStatus.Idle': 'Inattivo',
    'pipelineRunStatus.Other': 'Altro',
    'pipelineRunDuration.lessThanSec': 'meno di un secondo',
    'pipelineRunDuration.hour_one': '{{count}} ora',
    'pipelineRunDuration.hour_other': '{{count}} ore',
    'pipelineRunDuration.minute_one': '{{count}} minuto',
    'pipelineRunDuration.minute_other': '{{count}} minuti',
    'pipelineRunDuration.second_one': '{{count}} secondo',
    'pipelineRunDuration.second_other': '{{count}} secondi',
    'pipelineRunParamsAndResults.title': 'Parametri e risultati di PipelineRun',
    'pipelineRunParamsAndResults.noParams': 'Nessun parametro trovato',
    'pipelineRunParamsAndResults.noResults': 'Nessun risultato trovato',
    'pipelineRunParamsAndResults.params': 'Parametri',
    'pipelineRunParamsAndResults.results': 'Risultati',
    'pipelineRunParamsAndResults.outputTableColumn.name': 'Nome',
    'pipelineRunParamsAndResults.outputTableColumn.value': 'Valore',
  },
});

export default tektonTranslationIt;
