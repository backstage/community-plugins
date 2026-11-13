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
import { devTranslationRef } from './ref';

/**
 * French translation of the dev app tours.
 *
 * @alpha
 */
const devTranslationFr = createTranslationMessages({
  ref: devTranslationRef,
  messages: {
    'catalogTour.title': 'Le catalogue logiciel',
    'catalogTour.description':
      'Les filtres, le tableau des entités et la recherche sur la page du catalogue.',
    'catalogTour.kind.title': 'Choisissez un type',
    'catalogTour.kind.content':
      'Le catalogue contient plus que des composants : changez le **type** pour voir les API, systèmes, utilisateurs, groupes ou modèles.',
    'catalogTour.personal.title': 'Les vôtres, vos favoris ou tout',
    'catalogTour.personal.content':
      '_Possédés_ montre ce que vos groupes possèdent, _Favoris_ vos favoris et _Tous_ toute l’entreprise.',
  },
});

export default devTranslationFr;
