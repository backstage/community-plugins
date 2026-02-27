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
 * es translation for plugin.argocd.
 * @public
 */
const argocdTranslationEs = createTranslationMessages({
  ref: argocdTranslationRef,
  messages: {
    'appStatus.appHealthStatus.Healthy': 'En buen estado',
    'appStatus.appHealthStatus.Suspended': 'Suspendida',
    'appStatus.appHealthStatus.Degraded': 'Degradada',
    'appStatus.appHealthStatus.Progressing': 'En curso',
    'appStatus.appHealthStatus.Missing': 'Faltante',
    'appStatus.appHealthStatus.Unknown': 'Desconocida',
    'appStatus.appSyncStatus.Unknown': 'Desconocida',
    'appStatus.appSyncStatus.Synced': 'Sincronizada',
    'appStatus.appSyncStatus.OutOfSync': 'Fuera de sincronización',
    'common.appServer.title':
      'Este es el clúster local donde está instalado Argo CD.',
    'common.permissionAlert.alertTitle': 'Permiso requerido',
    'common.permissionAlert.alertText':
      'Para ver el complemento Argo CD, comuníquese con su administrador para que le otorgue el permiso argocd.view.read.',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.name':
      'Nombre',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.kind': 'Tipo',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.createdAt':
      'Creado en',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.syncStatus':
      'Estado de sincronización',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.healthStatus':
      'Estado',
    'deploymentLifecycle.sidebar.resources.resourcesTable.ariaLabelledBy':
      'Recursos',
    'deploymentLifecycle.sidebar.resources.resourcesTable.noneFound':
      'No se encontraron recursos',
    'deploymentLifecycle.sidebar.resources.resourcesTableRow.ariaLabel':
      'expandir fila',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistory.bodyText':
      'Historial de implementación',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistoryCommit.deployedText':
      'implementado',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.title':
      'Imágenes',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.tooltipText':
      'Estas son las imágenes para todas las implementaciones en la aplicación Argo CD.',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.namespace':
      'Espacio de nombres',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.commit':
      'Confirmar',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.namespace':
      'Espacio de nombres',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.strategy':
      'Estrategia',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.status':
      'Estado',
    'deploymentLifecycle.sidebar.resources.resource.resourceMetadata.namespace':
      'Espacio de nombres',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.iconButton.ariaLabel':
      'más',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.refresh':
      'Actualizar',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.sync':
      'Sincronizar',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.placeholder':
      'Buscar por tipo',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.ariaLabel':
      'borrar búsqueda',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SearchByName':
      'Nombre',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Kind':
      'Tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SyncStatus':
      'Estado de sincronización',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.HealthStatus':
      'Estado',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Unset':
      'Filtrar por',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.searchByNameInput':
      'Buscar por nombre',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusInput':
      'Filtrar por estado',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusInput':
      'Filtrar por estado de sincronización',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.kindInput':
      'Filtrar por tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.resourceFilters':
      'Filtros de recursos',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.syncStatus':
      'Estado de sincronización',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.kind':
      'Tipo',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Healthy':
      'En buen estado',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Suspended':
      'Suspendida',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Degraded':
      'Degradada',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Progressing':
      'En curso',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Missing':
      'Faltante',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Unknown':
      'Desconocida',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Synced':
      'Sincronizada',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Unknown':
      'Desconocida',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.OutOfSync':
      'Fuera de sincronización',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.textPrimary':
      'Ejecuciones de análisis',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.name':
      'Nombre:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.createdAt':
      'Creado en:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.status':
      'Estado:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.chipLabel':
      'Análisis',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.revision':
      'Revisión',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.stable':
      'Estable',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.active':
      'Activo',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.preview':
      'Vista previa',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revision':
      'Revisión',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.stable':
      'Estable',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.canary':
      'Canario',
    'deploymentLifecycle.sidebar.rollouts.revisions.revisionImage.textPrimary':
      'Tráfico a la imagen',
    'deploymentLifecycle.sidebar.rollouts.rollOut.title': 'Revisiones',
    'deploymentLifecycle.deploymentLifecycle.title':
      'Ciclo de vida de la implementación',
    'deploymentLifecycle.deploymentLifecycle.subtitle':
      'Revisar los componentes/sistemas implementados en el espacio de nombres mediante el complemento Argo CD',
    'deploymentLifecycle.deploymentLifecycleCard.instance': 'Instancia',
    'deploymentLifecycle.deploymentLifecycleCard.server': 'Servidor',
    'deploymentLifecycle.deploymentLifecycleCard.namespace':
      'Espacio de nombres',
    'deploymentLifecycle.deploymentLifecycleCard.commit': 'Confirmar',
    'deploymentLifecycle.deploymentLifecycleCard.tooltipText':
      'La confirmación SHA que se muestra a continuación es la última confirmación de la primera fuente de aplicación definida.',
    'deploymentLifecycle.deploymentLifecycleCard.resources': 'Recursos',
    'deploymentLifecycle.deploymentLifecycleCard.resourcesDeployed':
      'recursos implementados',
    'deploymentLifecycle.deploymentLifecycleDrawer.iconButtonTitle':
      'Cerrar el panel',
    'deploymentLifecycle.deploymentLifecycleDrawer.instance': 'Instancia',
    'deploymentLifecycle.deploymentLifecycleDrawer.cluster': 'Clúster',
    'deploymentLifecycle.deploymentLifecycleDrawer.namespace':
      'Espacio de nombres',
    'deploymentLifecycle.deploymentLifecycleDrawer.commit': 'Confirmar',
    'deploymentLifecycle.deploymentLifecycleDrawer.revision': 'Revisión',
    'deploymentLifecycle.deploymentLifecycleDrawer.resources': 'Recursos',
    'deploymentLifecycle.deploymentLifecycleDrawer.instanceDefaultValue':
      'predeterminado',
    'deploymentSummary.deploymentSummary.tableTitle':
      'Resumen de implementación',
    'deploymentSummary.deploymentSummary.columns.application': 'Application',
    'deploymentSummary.deploymentSummary.columns.namespace': 'Namespace',
    'deploymentSummary.deploymentSummary.columns.instance': 'Instancia',
    'deploymentSummary.deploymentSummary.columns.server': 'Servidor',
    'deploymentSummary.deploymentSummary.columns.revision': 'Revisión',
    'deploymentSummary.deploymentSummary.columns.lastDeployed':
      'Última implementación',
    'deploymentSummary.deploymentSummary.columns.syncStatus':
      'Estado de sincronización',
    'deploymentSummary.deploymentSummary.columns.healthStatus': 'Estado',
  },
});

export default argocdTranslationEs;
