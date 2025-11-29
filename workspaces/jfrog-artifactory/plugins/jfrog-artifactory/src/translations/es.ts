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
import { jfrogArtifactoryTranslationRef } from './ref';

const jfrogArtifactoryTranslationEs = createTranslationMessages({
  ref: jfrogArtifactoryTranslationRef,
  messages: {
    'page.title': 'Repositorio JFrog Artifactory: {{image}}',
    'table.searchPlaceholder': 'Filtrar',
    'table.labelRowsSelect': 'Filas',
    'table.columns.version': 'Versión',
    'table.columns.repositories': 'Repositorios',
    'table.columns.manifest': 'Manifiesto',
    'table.columns.modified': 'Modificado',
    'table.columns.size': 'Tamaño',
    'table.emptyContent.message': 'Aún no se han agregado datos,',
    'table.emptyContent.learnMore': 'aprenda cómo agregar datos.',
    'manifest.sha256': 'sha256',
  },
});

export default jfrogArtifactoryTranslationEs;
