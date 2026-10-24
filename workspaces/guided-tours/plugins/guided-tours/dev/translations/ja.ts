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
 * Japanese translation of the dev app tours.
 *
 * @alpha
 */
const devTranslationJa = createTranslationMessages({
  ref: devTranslationRef,
  messages: {
    'catalogTour.title': 'ソフトウェアカタログ',
    'catalogTour.description':
      'カタログページのフィルター、エンティティテーブル、検索。',
    'catalogTour.kind.title': '種類を選ぶ',
    'catalogTour.kind.content':
      'カタログにはコンポーネント以外も含まれます。**種類**を切り替えると、API、システム、ユーザー、グループ、テンプレートを表示できます。',
    'catalogTour.personal.title': '自分のもの、スター付き、またはすべて',
    'catalogTour.personal.content':
      '_所有_ はあなたのグループが所有するもの、_スター付き_ はお気に入り、_すべて_ は会社全体を表示します。',
  },
});

export default devTranslationJa;
