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
 * de translation for tekton.
 * @public
 */
const tektonTranslationDe = createTranslationMessages({
  ref: tektonTranslationRef,
  messages: {
    'errorPanel.title': 'Problem beim Abrufen von Kubernetes-Objekten',
    'errorPanel.description':
      'Es gab ein Problem beim Abrufen einiger Kubernetes-Ressourcen für das Element: {{entityName}}. Dies könnte bedeuten, dass die Karte mit den Fehlerberichten nicht ganz korrekt ist.',
    'permissionAlert.title': 'Berechtigung erforderlich',
    'permissionAlert.description':
      'Zum Anzeigen von Tekton-Pipeline-Ausführungen wenden Sie sich an den Administrator, um die folgende(n) Berechtigung(en) zu erhalten: {{permissions}}.',
    'statusSelector.label': 'Status',
    'clusterSelector.label': 'Cluster',
    'tableExpandCollapse.collapseAll': 'Alle komprimieren',
    'tableExpandCollapse.expandAll': 'Alle erweitern',
    'pipelineVisualization.emptyState.description':
      'Keine Pipeline-Ausführung zur Visualisierung',
    'pipelineVisualization.noTasksDescription':
      'Diese Pipeline-Ausführung enthält keine zu visualisierenden Aufgaben.',
    'pipelineVisualization.stepList.finallyTaskTitle': 'Abschließende Aufgabe',
    'pipelineRunList.title': 'Pipeline-Ausführungen',
    'pipelineRunList.noPipelineRuns': 'Keine Pipeline-Ausführungen gefunden',
    'pipelineRunList.searchBarPlaceholder': 'Suchen',
    'pipelineRunList.rowActions.viewParamsAndResults':
      'Parameter und Ergebnisse anzeigen',
    'pipelineRunList.rowActions.viewLogs': 'Logs anzeigen',
    'pipelineRunList.rowActions.unauthorizedViewLogs':
      'Keine Berechtigung zum Anzeigen von Logs',
    'pipelineRunList.rowActions.viewSBOM': 'SBOM anzeigen',
    'pipelineRunList.rowActions.SBOMNotApplicable':
      "'SBOM anzeigen' ist für diese Pipeline-Ausführung nicht anwendbar.",
    'pipelineRunList.rowActions.viewOutput': 'Ausgabe anzeigen',
    'pipelineRunList.rowActions.outputNotApplicable':
      "'Ausgabe anzeigen' ist für diese Pipeline-Ausführung nicht anwendbar.",
    'pipelineRunList.vulnerabilitySeverityTitle.critical': 'Kritisch',
    'pipelineRunList.vulnerabilitySeverityTitle.high': 'Hoch',
    'pipelineRunList.vulnerabilitySeverityTitle.medium': 'Mittel',
    'pipelineRunList.vulnerabilitySeverityTitle.low': 'Niedrig',
    'pipelineRunList.tableHeaderTitle.name': 'NAME',
    'pipelineRunList.tableHeaderTitle.vulnerabilities': 'SCHWACHSTELLEN',
    'pipelineRunList.tableHeaderTitle.status': 'STATUS',
    'pipelineRunList.tableHeaderTitle.taskStatus': 'AUFGABENSTATUS',
    'pipelineRunList.tableHeaderTitle.startTime': 'GESTARTET',
    'pipelineRunList.tableHeaderTitle.duration': 'DAUER',
    'pipelineRunList.tableHeaderTitle.actions': 'AKTIONEN',
    'pipelineRunList.tablePagination.rowsPerPageOptionLabel': '{{num}} Zeilen',
    'pipelineRunLogs.title': 'Logs der Pipeline-Ausführung',
    'pipelineRunLogs.noLogs': 'Keine Logs gefunden',
    'pipelineRunLogs.downloader.downloadTaskLogs': 'Herunterladen',
    'pipelineRunLogs.downloader.downloadPipelineRunLogs':
      'Alle Aufgaben-Logs herunterladen',
    'pipelineRunLogs.podLogsDownloadLink.title': 'Herunterladen',
    'pipelineRunLogs.podLogsDownloadLink.downloading':
      'Logs werden heruntergeladen',
    'pipelineRunLogs.taskStatusStepper.skipped': 'Übersprungen',
    'pipelineRunOutput.title': 'Ausgabe der Pipeline-Ausführung',
    'pipelineRunOutput.noOutput': 'Keine Ausgabe',
    'pipelineRunStatus.All': 'Alle',
    'pipelineRunStatus.Cancelling': 'Wird abgebrochen',
    'pipelineRunStatus.Succeeded': 'Erfolgreich',
    'pipelineRunStatus.Failed': 'Fehlgeschlagen',
    'pipelineRunStatus.Running': 'Wird ausgeführt',
    'pipelineRunStatus.FailedToStart': 'Start fehlgeschlagen',
    'pipelineRunStatus.PipelineNotStarted': 'Pipeline nicht gestartet',
    'pipelineRunStatus.Skipped': 'Übersprungen',
    'pipelineRunStatus.Cancelled': 'Abgebrochen',
    'pipelineRunStatus.Pending': 'Ausstehend',
    'pipelineRunStatus.Idle': 'Leerlauf',
    'pipelineRunStatus.Other': 'Andere',
    'pipelineRunDuration.lessThanSec': 'weniger als eine Sekunde',
    'pipelineRunDuration.hour_one': '{{count}} Stunde',
    'pipelineRunDuration.hour_other': '{{count}} Stunden',
    'pipelineRunDuration.minute_one': '{{count}} Minute',
    'pipelineRunDuration.minute_other': '{{count}} Minuten',
    'pipelineRunDuration.second_one': '{{count}} Sekunde',
    'pipelineRunDuration.second_other': '{{count}} Sekunden',
    'pipelineRunParamsAndResults.title':
      'Parameter und Ergebnisse für Pipeline-Ausführung',
    'pipelineRunParamsAndResults.noParams': 'Keine Parameter gefunden',
    'pipelineRunParamsAndResults.noResults': 'Keine Ergebnisse gefunden',
    'pipelineRunParamsAndResults.params': 'Parameter',
    'pipelineRunParamsAndResults.results': 'Ergebnisse',
    'pipelineRunParamsAndResults.outputTableColumn.name': 'Name',
    'pipelineRunParamsAndResults.outputTableColumn.value': 'Wert',
  },
});

export default tektonTranslationDe;
