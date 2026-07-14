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

/**
 * de translation for plugin.servicenow.
 * @public
 */
const servicenowTranslationDe = createTranslationMessages({
  ref: servicenowTranslationRef,
  messages: {
    'page.title': 'ServiceNow-Tickets',
    'page.titleWithCount': 'ServiceNow-Tickets ({{count}})',
    'filter.state': 'Status',
    'filter.priority': 'Priorität',
    'priority.critical': 'Kritisch',
    'priority.high': 'Hoch',
    'priority.moderate': 'Mittel',
    'priority.low': 'Niedrig',
    'priority.planning': 'Planung',
    'incidentState.new': 'Neu',
    'incidentState.inProgress': 'In Bearbeitung',
    'incidentState.onHold': 'Zurückgestellt',
    'incidentState.resolved': 'Gelöst',
    'incidentState.closed': 'Geschlossen',
    'incidentState.cancelled': 'Storniert',
    'errors.loadingIncidents': 'Fehler beim Laden der Vorfälle: {{error}}',
    'table.searchPlaceholder': 'Suchen',
    'table.labelRowsSelect': '{{count}} Zeilen',
    'table.rowsPerPageLabel': 'Zeilen pro Seite',
    'table.selectPlaceholder': 'Auswählen...',
    'table.itemsSelected': '{{count}} ausgewählt',
    'table.paginationInfo': '{{start}}-{{end}} von {{total}}',
    'table.columns.incidentNumber': 'Vorfallnummer',
    'table.columns.description': 'Beschreibung',
    'table.columns.created': 'Erstellt',
    'table.columns.priority': 'Priorität',
    'table.columns.state': 'Status',
    'table.columns.actions': 'Aktionen',
    'table.emptyContent': 'Keine Datensätze gefunden',
    'table.pagination.first': 'Zur ersten Seite',
    'table.pagination.previous': 'Zur vorherigen Seite',
    'table.pagination.next': 'Zur nächsten Seite',
    'table.pagination.last': 'Zur letzten Seite',
    'actions.openInServicenow': 'In ServiceNow öffnen',
    'actions.clearSearch': 'Suche löschen',
  },
});

export default servicenowTranslationDe;
