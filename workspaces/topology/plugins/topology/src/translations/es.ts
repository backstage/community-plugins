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
import { topologyTranslationRef } from './ref';

/**
 * es translation for plugin.topology.
 * @public
 */
const topologyTranslationEs = createTranslationMessages({
  ref: topologyTranslationRef,
  messages: {
    'page.title': 'Topología',
    'page.subtitle':
      'Visualización de la topología de la carga de trabajo de Kubernetes',
    'toolbar.cluster': 'Clúster',
    'toolbar.selectCluster': 'Seleccionar clúster',
    'toolbar.displayOptions': 'Opciones de visualización',
    'toolbar.currentDisplayOptions': 'Opciones de visualización actuales',
    'controlBar.zoomIn': 'Acercar',
    'controlBar.zoomOut': 'Alejar',
    'controlBar.fitToScreen': 'Ajustar a la pantalla',
    'controlBar.resetView': 'Restablecer vista',
    'emptyState.noResourcesFound': 'No se encontraron recursos',
    'emptyState.noResourcesDescription':
      'No se encontraron recursos de Kubernetes en el clúster seleccionado.',
    'permissions.missingPermission': 'Permiso faltante',
    'permissions.missingPermissionDescription':
      'Para ver la topología, su administrador debe otorgarle {{permissions}} {{permissionText}}.',
    'permissions.missingPermissionDescription_plural':
      'Para ver la topología, su administrador debe otorgarle {{permissions}} {{permissionText}}.',
    'permissions.permission': 'permiso',
    'permissions.permissions': 'permisos',
    'permissions.goBack': 'Volver',
    'sideBar.details': 'Detalles',
    'sideBar.resources': 'Recursos',
    'status.running': 'En ejecución',
    'status.pending': 'Pendiente',
    'status.succeeded': 'Ejecución exitosa',
    'status.failed': 'Fallido',
    'status.unknown': 'Desconocido',
    'status.terminating': 'Terminando',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'Error',
    'status.warning': 'Advertencia',
    'status.ready': 'Listo',
    'status.notReady': 'No está listo',
    'status.active': 'Activo',
    'status.inactive': 'Inactivo',
    'status.updating': 'Actualizando',
    'status.evicted': 'Desalojado',
    'status.cancelled': 'Cancelado',
    'details.name': 'Nombre',
    'details.namespace': 'Espacio de nombres',
    'details.labels': 'Etiquetas',
    'details.annotations': 'Anotaciones',
    'details.createdAt': 'Creado',
    'details.age': 'Edad',
    'details.replicas': 'Réplicas',
    'details.availableReplicas': 'Réplicas disponibles',
    'details.readyReplicas': 'Réplicas listas',
    'details.updatedReplicas': 'Réplicas actualizadas',
    'details.selector': 'Selector',
    'details.strategy': 'Estrategia',
    'details.image': 'Imagen',
    'details.ports': 'Puertos',
    'details.volumes': 'Volúmenes',
    'details.volumeMounts': 'Montajes de volumen',
    'details.environmentVariables': 'Variables de entorno',
    'details.resourceRequirements': 'Requisitos de recursos',
    'details.limits': 'Límites',
    'details.requests': 'Solicitudes',
    'details.cpu': 'CPU',
    'details.memory': 'Memoria',
    'details.storage': 'Almacenamiento',
    'details.noLabels': 'Sin etiquetas',
    'details.noAnnotations': 'Sin anotaciones',
    'details.noOwner': 'Sin propietario',
    'details.notAvailable': 'No disponible',
    'details.notConfigured': 'No configurado',
    'details.updateStrategy': 'Estrategia de actualización',
    'details.maxUnavailable': 'Máximo no disponible',
    'details.maxSurge': 'Aumento máximo',
    'details.progressDeadlineSeconds':
      'Segundos de la fecha límite de progreso',
    'details.minReadySeconds': 'Segundos mínimos de preparación',
    'details.desiredCompletions': 'Finalizaciones deseadas',
    'details.parallelism': 'Paralelismo',
    'details.activeDeadlineSeconds': 'Segundos de fecha límite activa',
    'details.currentCount': 'Recuento actual',
    'details.desiredCount': 'Recuento deseado',
    'details.schedule': 'Cronograma',
    'details.concurrencyPolicy': 'Política de concurrencia',
    'details.startingDeadlineSeconds': 'Segundos de fecha límite de inicio',
    'details.lastScheduleTime': 'Última hora programada',
    'details.maxSurgeDescription': '{{maxSurge}} mayor que {{replicas}} pod',
    'details.maxUnavailableDescription':
      '{{maxUnavailable}} de {{replicas}} pod',
    'logs.download': 'Descargar',
    'logs.noLogsFound': 'No se encontraron registros',
    'logs.selectContainer': 'Seleccionar contenedor',
    'logs.container': 'Contenedor',
    'logs.pod': 'Pod',
    'logs.showPrevious': 'Mostrar anterior',
    'logs.follow': 'Seguir',
    'logs.refresh': 'Actualizar',
    'logs.timestamps': 'Marcas de tiempo',
    'logs.wrapLines': 'Envolver líneas',
    'logs.clearLogs': 'Borrar registros',
    'logs.logLevel': 'Nivel de registro',
    'logs.search': 'Buscar',
    'logs.noMatchingLogs': 'No se encontraron registros coincidentes',
    'resources.noResourcesFound':
      'No se encontró {{resourceType}} para este recurso.',
    'resources.showingLatest':
      'Se muestran los últimos {{count}} {{resourceType}}',
    'time.seconds': 'segundos',
    'time.minutes': 'minutos',
    'time.hours': 'horas',
    'time.days': 'días',
    'events.type': 'Tipo',
    'events.reason': 'Razón',
    'events.message': 'Mensaje',
    'events.source': 'Fuente',
    'events.firstSeen': 'Visto por primera vez',
    'events.lastSeen': 'Visto por última vez',
    'events.count': 'Recuento',
    'events.noEventsFound': 'No se encontraron eventos',
    'filters.showLabels': 'Mostrar etiquetas',
    'filters.showPodCount': 'Mostrar recuento de pods',
    'filters.expandApplicationGroups': 'Expandir grupos de aplicaciones',
    'filters.showConnectors': 'Mostrar conectores',
    'common.status': 'Estado',
    'common.owner': 'Propietario',
    'common.location': 'Ubicación',
    'common.viewLogs': 'Ver registros',
    'bootOrder.summary': 'Resumen del orden de arranque',
    'bootOrder.emptySummary': 'No hay orden de arranque configurado',
    'bootOrder.disk': 'Disco',
    'bootOrder.network': 'Red',
    'bootOrder.cdrom': 'CD-ROM',
    'vm.status.starting': 'Iniciada',
    'vm.status.stopping': 'Detenida',
    'vm.status.stopped': 'Interrumpida',
    'vm.status.paused': 'En pausa',
    'vm.status.migrating': 'En migración',
    'vm.status.provisioning': 'En aprovisionamiento',
    'vm.status.errorUnschedulable': 'ErrorUnschedulable',
    'vm.status.errorImagePull': 'ErrorImagePull',
    'vm.status.imageNotReady': 'ImageNotReady',
    'vm.status.waitingForVolumeBinding': 'WaitingForVolumeBinding',
  },
});

export default topologyTranslationEs;
