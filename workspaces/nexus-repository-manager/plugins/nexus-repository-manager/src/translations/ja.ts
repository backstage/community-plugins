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

const nexusRepositoryManagerTranslationJa = createTranslationMessages({
  ref: nexusRepositoryManagerTranslationRef,
  full: true,
  messages: {
    'table.title': 'Nexus Repository Manager: {{title}}',
    'table.searchPlaceholder': 'フィルター',
    'table.labelRowsSelect': '行',
    'table.columns.version': 'バージョン',
    'table.columns.artifact': 'アーティファクト',
    'table.columns.repositoryType': 'リポジトリタイプ',
    'table.columns.checksum': 'チェックサム',
    'table.columns.modified': '変更日時',
    'table.columns.size': 'サイズ',
    'table.emptyValue': '該当なし',
    'table.emptyContent.message': 'データがまだ追加されていません。',
    'table.emptyContent.linkText': 'データの追加方法を学ぶ',
    'entityContent.title': 'ビルドアーティファクト',
  },
});

export default nexusRepositoryManagerTranslationJa;
