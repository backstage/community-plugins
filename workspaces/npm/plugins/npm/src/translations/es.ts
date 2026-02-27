/*
 * Copyright 2024 The Backstage Authors
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
import { npmTranslationRef } from './ref';

/**
 * es translation for plugin.npm.translation-ref.
 * @public
 */
const npmTranslationEs = createTranslationMessages({
  ref: npmTranslationRef,
  messages: {
    'infoCard.title': 'Paquete NPM {{packageName}}',
    'infoCard.latestVersion': 'Última versión',
    'infoCard.publishedAt': 'Publicado en',
    'infoCard.license': 'Licencia',
    'infoCard.description': 'Descripción',
    'infoCard.keywords': 'Palabras clave',
    'infoCard.registryName': 'Nombre de registro',
    'infoCard.npmRepository': 'Repositorio NPM',
    'infoCard.codeRepository': 'Repositorio de código',
    'infoCard.issueTracker': 'Seguimiento de problemas',
    'infoCard.homepage': 'Página de inicio',
    'releaseOverviewCard.title': 'Etiquetas actuales',
    'releaseOverviewCard.toolbar.searchPlaceholder': 'Buscar',
    'releaseOverviewCard.columns.tag': 'Etiqueta',
    'releaseOverviewCard.columns.version': 'Versión',
    'releaseOverviewCard.columns.published': 'Publicado',
    'releaseTableCard.title': 'Etiquetas actuales',
    'releaseTableCard.toolbar.searchPlaceholder': 'Buscar',
    'releaseTableCard.columns.tag': 'Etiqueta',
    'releaseTableCard.columns.version': 'Versión',
    'releaseTableCard.columns.published': 'Publicado',
    'versionHistoryCard.title': 'Historial de versiones',
    'versionHistoryCard.toolbar.searchPlaceholder': 'Buscar',
    'versionHistoryCard.columns.version': 'Versión',
    'versionHistoryCard.columns.published': 'Publicado',
  },
});

export default npmTranslationEs;
