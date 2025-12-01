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

const nexusRepositoryManagerTranslationDe = createTranslationMessages({
  ref: nexusRepositoryManagerTranslationRef,
  full: true,
  messages: {
    'table.title': 'Nexus Repository Manager: {{title}}',
    'table.searchPlaceholder': 'Filtern',
    'table.labelRowsSelect': 'Zeilen',
    'table.columns.version': 'Version',
    'table.columns.artifact': 'Artefakt',
    'table.columns.repositoryType': 'Repository-Typ',
    'table.columns.checksum': 'Prüfsumme',
    'table.columns.modified': 'Geändert',
    'table.columns.size': 'Größe',
    'table.emptyValue': 'N/V',
    'table.emptyContent.message': 'Es wurden noch keine Daten hinzugefügt,',
    'table.emptyContent.linkText': 'erfahren Sie, wie Sie Daten hinzufügen',
    'entityContent.title': 'Build-Artefakte',
  },
});

export default nexusRepositoryManagerTranslationDe;
