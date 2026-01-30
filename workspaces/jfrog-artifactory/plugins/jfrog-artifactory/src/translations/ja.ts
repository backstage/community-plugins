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

/**
 * Japanese translation for plugin.jfrog-artifactory.
 * @public
 */
const jfrogArtifactoryTranslationJa = createTranslationMessages({
  ref: jfrogArtifactoryTranslationRef,
  messages: {
    'page.title': 'JFrog Artifactory リポジトリー: {{image}}',
    'table.searchPlaceholder': 'フィルター',
    'table.labelRowsSelect': '行',
    'table.columns.version': 'バージョン',
    'table.columns.repositories': 'リポジトリー',
    'table.columns.manifest': 'マニフェスト',
    'table.columns.modified': '更新済み',
    'table.columns.size': 'サイズ',
    'table.emptyContent.message': 'まだデータが追加されていません。',
    'table.emptyContent.learnMore': 'データの追加方法をご覧ください。',
    'manifest.sha256': 'sha256',
  },
});

export default jfrogArtifactoryTranslationJa;
