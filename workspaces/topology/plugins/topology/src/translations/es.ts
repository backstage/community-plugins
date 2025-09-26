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

const topologyTranslationEs = createTranslationMessages({
  ref: topologyTranslationRef,
  messages: {
    // CRITICAL: Use flat dot notation, not nested objects
    'page.title': 'Topología',
    'page.subtitle':
      'Visualización de topología de cargas de trabajo de Kubernetes',
    'toolbar.cluster': 'Clúster',
    'toolbar.selectCluster': 'Seleccionar clúster',
    'toolbar.displayOptions': 'Opciones de visualización',
    'toolbar.currentDisplayOptions': 'Opciones de visualización actuales',
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
    'status.running': 'Ejecutándose',
    'status.pending': 'Pendiente',
    'status.succeeded': 'Exitoso',
    'status.failed': 'Fallido',
    'status.unknown': 'Desconocido',
    'status.terminating': 'Terminando',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'Error',
    'status.warning': 'Advertencia',
    'status.ready': 'Listo',
    'status.notReady': 'No listo',
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
    'details.age': 'Antigüedad',
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
    'details.desiredCompletions': 'Finalizaciones deseadas',
    'details.parallelism': 'Paralelismo',
    'details.activeDeadlineSeconds': 'Segundos de fecha límite activa',
    'details.currentCount': 'Recuento actual',
    'details.desiredCount': 'Recuento deseado',
    'details.schedule': 'Horario',
    'details.concurrencyPolicy': 'Política de concurrencia',
    'details.startingDeadlineSeconds': 'Segundos de fecha límite de inicio',
    'details.lastScheduleTime': 'Última hora de programación',
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
    'logs.wrapLines': 'Ajustar líneas',
    'logs.clearLogs': 'Limpiar registros',
    'logs.logLevel': 'Nivel de registro',
    'logs.search': 'Buscar',
    'logs.noMatchingLogs': 'No se encontraron registros coincidentes',
    'resources.noResourcesFound':
      'No se encontraron {{resourceType}} para este recurso.',
    'resources.showingLatest':
      'Mostrando los últimos {{count}} {{resourceType}}',
    'time.seconds': 'segundos',
    'time.minutes': 'minutos',
    'time.hours': 'horas',
    'time.days': 'días',
    'events.type': 'Tipo',
    'events.reason': 'Razón',
    'events.message': 'Mensaje',
    'events.source': 'Origen',
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
    'bootOrder.emptySummary': 'No se configuró orden de arranque',
    'bootOrder.disk': 'Disco',
    'bootOrder.network': 'Red',
    'bootOrder.cdrom': 'CD-ROM',
    'vm.status.starting': 'Iniciando',
    'vm.status.stopping': 'Deteniéndose',
    'vm.status.stopped': 'Detenido',
    'vm.status.paused': 'Pausado',
    'vm.status.migrating': 'Migrando',
    'vm.status.provisioning': 'Aprovisionando',
    'vm.status.errorUnschedulable': 'Error no programable',
    'vm.status.errorImagePull': 'Error al extraer imagen',
    'vm.status.imageNotReady': 'Imagen no lista',
    'vm.status.waitingForVolumeBinding': 'Esperando enlace de volumen',
  },
});

export default topologyTranslationEs;
