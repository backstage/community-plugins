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

const servicenowTranslationIt = createTranslationMessages({
  ref: servicenowTranslationRef,
  messages: {
    'page.title': 'Ticket ServiceNow',
    'page.titleWithCount': 'Ticket ServiceNow ({{count}})',
    'table.searchPlaceholder': 'Cerca',
    'table.labelRowsSelect': '{{count}} righe',
    'table.columns.incidentNumber': 'Numero incidente',
    'table.columns.description': 'Descrizione',
    'table.columns.created': 'Creato',
    'table.columns.priority': 'Priorità',
    'table.columns.state': 'Stato',
    'table.columns.actions': 'Azioni',
    'table.emptyContent': 'Nessun record trovato',
    'filter.state': 'Stato',
    'filter.priority': 'Priorità',
    'priority.critical': 'Critica',
    'priority.high': 'Alta',
    'priority.moderate': 'Moderata',
    'priority.low': 'Bassa',
    'priority.planning': 'Pianificazione',
    'incidentState.new': 'Nuovo',
    'incidentState.inProgress': 'In corso',
    'incidentState.onHold': 'In attesa',
    'incidentState.resolved': 'Risolto',
    'incidentState.closed': 'Chiuso',
    'incidentState.cancelled': 'Annullato',
    'errors.loadingIncidents':
      'Errore durante il caricamento degli incidenti: {{error}}',
    'actions.openInServicenow': 'Apri in ServiceNow',
  },
});

export default servicenowTranslationIt;
