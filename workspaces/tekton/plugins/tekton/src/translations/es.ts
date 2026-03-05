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
 * es translation for tekton.
 * @public
 */
const tektonTranslationEs = createTranslationMessages({
  ref: tektonTranslationRef,
  messages: {
    'errorPanel.title':
      'Ocurrió un problema al recuperar objetos de Kubernetes',
    'errorPanel.description':
      'Ocurrió un problema al recuperar algunos recursos de Kubernetes para la entidad: {{entityName}}. Esto podría significar que la tarjeta de informe de errores no es completamente precisa.',
    'permissionAlert.title': 'Permiso requerido',
    'permissionAlert.description':
      'Para ver las ejecuciones de pipeline de Tekton, comuníquese con su administrador para que le otorgue los siguientes permisos: {{permissions}}.',
    'statusSelector.label': 'Estado',
    'clusterSelector.label': 'Clúster',
    'tableExpandCollapse.collapseAll': 'Contraer todo',
    'tableExpandCollapse.expandAll': 'Expandir todo',
    'pipelineVisualization.emptyState.description':
      'No hay ejecución de pipeline para visualizar',
    'pipelineVisualization.noTasksDescription':
      'Esta ejecución de pipeline no tiene tareas para visualizar',
    'pipelineVisualization.stepList.finallyTaskTitle': 'Tarea final',
    'pipelineRunList.title': 'Ejecuciones de pipeline',
    'pipelineRunList.noPipelineRuns':
      'No se encontraron ejecuciones de pipeline',
    'pipelineRunList.searchBarPlaceholder': 'Buscar',
    'pipelineRunList.rowActions.viewParamsAndResults':
      'Ver parámetros y resultados',
    'pipelineRunList.rowActions.viewLogs': 'Ver registros',
    'pipelineRunList.rowActions.unauthorizedViewLogs':
      'No tiene autorización para ver los registros',
    'pipelineRunList.rowActions.viewSBOM': 'Ver SBOM',
    'pipelineRunList.rowActions.SBOMNotApplicable':
      'Ver SBOM no es aplicable a esta ejecución de pipeline',
    'pipelineRunList.rowActions.viewOutput': 'Ver salida',
    'pipelineRunList.rowActions.outputNotApplicable':
      'Ver salida no es aplicable para esta ejecución de pipeline',
    'pipelineRunList.vulnerabilitySeverityTitle.critical': 'Crítica',
    'pipelineRunList.vulnerabilitySeverityTitle.high': 'Alta',
    'pipelineRunList.vulnerabilitySeverityTitle.medium': 'Media',
    'pipelineRunList.vulnerabilitySeverityTitle.low': 'Baja',
    'pipelineRunList.tableHeaderTitle.name': 'NOMBRE',
    'pipelineRunList.tableHeaderTitle.vulnerabilities': 'VULNERABILIDADES',
    'pipelineRunList.tableHeaderTitle.status': 'ESTADO',
    'pipelineRunList.tableHeaderTitle.taskStatus': 'ESTADO DE LA TAREA',
    'pipelineRunList.tableHeaderTitle.startTime': 'INICIADA',
    'pipelineRunList.tableHeaderTitle.duration': 'DURACIÓN',
    'pipelineRunList.tableHeaderTitle.actions': 'ACCIONES',
    'pipelineRunList.tablePagination.rowsPerPageOptionLabel': '{{num}} filas',
    'pipelineRunLogs.title': 'Registros de ejecuciones de pipeline',
    'pipelineRunLogs.noLogs': 'No se encontraron registros',
    'pipelineRunLogs.downloader.downloadTaskLogs': 'Descargar',
    'pipelineRunLogs.downloader.downloadPipelineRunLogs':
      'Descargar todos los registros de tareas',
    'pipelineRunLogs.podLogsDownloadLink.title': 'Descargar',
    'pipelineRunLogs.podLogsDownloadLink.downloading': 'descargando registros',
    'pipelineRunLogs.taskStatusStepper.skipped': 'Omitida',
    'pipelineRunOutput.title': 'Salida de la ejecución de pipeline',
    'pipelineRunOutput.noOutput': 'Sin salida',
    'pipelineRunStatus.All': 'Todos',
    'pipelineRunStatus.Cancelling': 'Cancelada',
    'pipelineRunStatus.Succeeded': 'Ejecución exitosa',
    'pipelineRunStatus.Failed': 'Fallida',
    'pipelineRunStatus.Running': 'En ejecución',
    'pipelineRunStatus.FailedToStart': 'Error al iniciar',
    'pipelineRunStatus.PipelineNotStarted': 'Pipeline no iniciado',
    'pipelineRunStatus.Skipped': 'Omitida',
    'pipelineRunStatus.Cancelled': 'Cancelada',
    'pipelineRunStatus.Pending': 'Pendiente',
    'pipelineRunStatus.Idle': 'Inactiva',
    'pipelineRunStatus.Other': 'Otro',
    'pipelineRunDuration.lessThanSec': 'menos de un segundo',
    'pipelineRunDuration.hour_one': '{{count}} hora',
    'pipelineRunDuration.hour_other': '{{count}} horas',
    'pipelineRunDuration.minute_one': '{{count}} minuto',
    'pipelineRunDuration.minute_other': '{{count}} minutos',
    'pipelineRunDuration.second_one': '{{count}} segundo',
    'pipelineRunDuration.second_other': '{{count}} segundos',
    'pipelineRunParamsAndResults.title':
      'Parámetros y resultados de la ejecución de pipeline',
    'pipelineRunParamsAndResults.noParams': 'No se encontraron parámetros',
    'pipelineRunParamsAndResults.noResults': 'No se encontraron resultados',
    'pipelineRunParamsAndResults.params': 'Parámetros',
    'pipelineRunParamsAndResults.results': 'Resultados',
    'pipelineRunParamsAndResults.outputTableColumn.name': 'Nombre',
    'pipelineRunParamsAndResults.outputTableColumn.value': 'Valor',
  },
});

export default tektonTranslationEs;
