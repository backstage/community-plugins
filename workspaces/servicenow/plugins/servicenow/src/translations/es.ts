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
import { servicenowTranslationRef } from './ref';

const servicenowTranslationEs = createTranslationMessages({
  ref: servicenowTranslationRef,
  messages: {
    'page.title': 'Tickets de ServiceNow',
    'page.titleWithCount': 'Tickets de ServiceNow ({{count}})',
    'table.searchPlaceholder': 'Buscar',
    'table.labelRowsSelect': '{{count}} filas',
    'table.columns.incidentNumber': 'Número de incidente',
    'table.columns.description': 'Descripción',
    'table.columns.created': 'Creado',
    'table.columns.priority': 'Prioridad',
    'table.columns.state': 'Estado',
    'table.columns.actions': 'Acciones',
    'table.emptyContent': 'No se encontraron registros',
    'filter.state': 'Estado',
    'filter.priority': 'Prioridad',
    'priority.critical': 'Crítica',
    'priority.high': 'Alta',
    'priority.moderate': 'Moderada',
    'priority.low': 'Baja',
    'priority.planning': 'Planificación',
    'incidentState.new': 'Nuevo',
    'incidentState.inProgress': 'En progreso',
    'incidentState.onHold': 'En espera',
    'incidentState.resolved': 'Resuelto',
    'incidentState.closed': 'Cerrado',
    'incidentState.cancelled': 'Cancelado',
    'errors.loadingIncidents': 'Error al cargar incidentes: {{error}}',
    'actions.openInServicenow': 'Abrir en ServiceNow',
  },
});

export default servicenowTranslationEs;
