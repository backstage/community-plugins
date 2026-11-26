/*
 * Copyright 2026 The Backstage Authors
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
import { createTranslationMessages } from '@backstage/frontend-plugin-api';
import { guidedTourTranslationRef } from './ref';

/**
 * French translation of the guided tours plugin.
 *
 * @alpha
 */
const guidedToursTranslationFr = createTranslationMessages({
  ref: guidedTourTranslationRef,
  messages: {
    'overlay.previous': 'Précédent',
    'overlay.next': 'Suivant',
    'overlay.done': 'Terminé',
    'overlay.close': 'Fermer la visite',
    'overlay.counter': 'Étape {{current}} sur {{total}}',
    'overlay.clickToContinue':
      'Cliquez sur l’élément mis en évidence pour continuer.',
    'overlay.loading': 'Recherche de l’étape suivante…',
    'overlay.contentError': 'Cette étape n’a pas pu être affichée.',
    'page.title': 'Visites guidées',
    'page.description':
      'Rejouez n’importe quelle visite à tout moment. Les visites prévues à la connexion démarrent d’elles-mêmes lors de votre première connexion.',
    'page.empty': 'Aucune visite guidée n’est installée.',
    'page.steps': '{{n}} étapes',
    'page.start': 'Démarrer',
    'page.continue': 'Continuer',
    'page.restart': 'Recommencer',
    'page.resetAll': 'Réinitialiser toutes les visites',
    'page.resetAllTitle': 'Réinitialiser toutes les visites ?',
    'page.resetAllBody':
      'La progression de toutes les visites est effacée et les visites de bienvenue seront rejouées lors de votre prochaine visite.',
    'page.cancel': 'Annuler',
    'page.confirm': 'Réinitialiser',
    'page.autoStartLogin': 'Démarre à la connexion',
    'page.autoStartPath': 'Démarre lors de la première visite de {{path}}',
    'page.status.new': 'Nouvelle',
    'page.status.inProgress': 'En cours',
    'page.status.completed': 'Terminée',
    'page.status.dismissed': 'Ignorée',
  },
});

export default guidedToursTranslationFr;
