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
 * Spanish translation of the dev app tours.
 *
 * @alpha
 */
const devTranslationEs = createTranslationMessages({
  ref: devTranslationRef,
  messages: {
    'catalogTour.title': 'El catálogo de software',
    'catalogTour.description':
      'Filtros, la tabla de entidades y la búsqueda en la página del catálogo.',
    'catalogTour.kind.title': 'Elija un tipo',
    'catalogTour.kind.content':
      'El catálogo contiene más que componentes: cambie el **tipo** para ver API, sistemas, usuarios, grupos o plantillas.',
    'catalogTour.personal.title': 'Propios, destacados o todos',
    'catalogTour.personal.content':
      '_Propios_ muestra lo que poseen sus grupos, _Destacados_ sus favoritos y _Todos_ toda la empresa.',
  },
});

export default devTranslationEs;
