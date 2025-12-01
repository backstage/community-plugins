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
import { nexusRepositoryManagerTranslationRef } from './ref';

const nexusRepositoryManagerTranslationEs = createTranslationMessages({
  ref: nexusRepositoryManagerTranslationRef,
  full: true,
  messages: {
    'table.title': 'Nexus Repository Manager: {{title}}',
    'table.searchPlaceholder': 'Filtrar',
    'table.labelRowsSelect': 'Filas',
    'table.columns.version': 'Versión',
    'table.columns.artifact': 'Artefacto',
    'table.columns.repositoryType': 'Tipo de repositorio',
    'table.columns.checksum': 'Suma de verificación',
    'table.columns.modified': 'Modificado',
    'table.columns.size': 'Tamaño',
    'table.emptyValue': 'N/D',
    'table.emptyContent.message': 'Aún no se han agregado datos,',
    'table.emptyContent.linkText': 'aprende cómo agregar datos',
    'entityContent.title': 'Artefactos de compilación',
  },
});

export default nexusRepositoryManagerTranslationEs;
