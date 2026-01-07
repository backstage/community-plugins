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

const servicenowTranslationFr = createTranslationMessages({
  ref: servicenowTranslationRef,
  messages: {
    'page.title': 'Tickets ServiceNow',
    'page.titleWithCount': 'Tickets ServiceNow ({{count}})',
    'table.searchPlaceholder': 'Rechercher',
    'table.labelRowsSelect': '{{count}} lignes',
    'table.columns.incidentNumber': "Numéro d'incident",
    'table.columns.description': 'Description',
    'table.columns.created': 'Créé',
    'table.columns.priority': 'Priorité',
    'table.columns.state': 'État',
    'table.columns.actions': 'Actions',
    'table.emptyContent': 'Aucun enregistrement trouvé',
    'filter.state': 'État',
    'filter.priority': 'Priorité',
    'priority.critical': 'Critique',
    'priority.high': 'Élevée',
    'priority.moderate': 'Modérée',
    'priority.low': 'Basse',
    'priority.planning': 'Planification',
    'incidentState.new': 'Nouveau',
    'incidentState.inProgress': 'En cours',
    'incidentState.onHold': 'En attente',
    'incidentState.resolved': 'Résolu',
    'incidentState.closed': 'Fermé',
    'incidentState.cancelled': 'Annulé',
    'errors.loadingIncidents':
      'Erreur lors du chargement des incidents: {{error}}',
    'actions.openInServicenow': 'Ouvrir dans ServiceNow',
  },
});

export default servicenowTranslationFr;
