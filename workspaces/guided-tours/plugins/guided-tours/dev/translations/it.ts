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
 * Italian translation of the dev app tours.
 *
 * @alpha
 */
const devTranslationIt = createTranslationMessages({
  ref: devTranslationRef,
  messages: {
    'catalogTour.title': 'Il catalogo software',
    'catalogTour.description':
      'Filtri, la tabella delle entità e la ricerca nella pagina del catalogo.',
    'catalogTour.kind.title': 'Scegli un tipo',
    'catalogTour.kind.content':
      'Il catalogo contiene più che componenti: cambia il **tipo** per vedere API, sistemi, utenti, gruppi o modelli.',
    'catalogTour.personal.title': 'Tuoi, preferiti o tutti',
    'catalogTour.personal.content':
      '_Posseduti_ mostra ciò che possiedono i tuoi gruppi, _Preferiti_ i tuoi preferiti e _Tutti_ l’intera azienda.',
  },
});

export default devTranslationIt;
