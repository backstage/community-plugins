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
import { guidedTourTranslationRef } from './ref';

/**
 * Japanese translation of the guided tours plugin.
 *
 * @alpha
 */
const guidedToursTranslationJa = createTranslationMessages({
  ref: guidedTourTranslationRef,
  messages: {
    'overlay.previous': '前へ',
    'overlay.next': '次へ',
    'overlay.done': '完了',
    'overlay.close': 'ツアーを閉じる',
    'overlay.counter': 'ステップ {{current}} / {{total}}',
    'overlay.clickToContinue': 'ハイライトされた要素をクリックして続行します。',
    'overlay.loading': '次のステップを探しています…',
    'overlay.contentError': 'このステップを表示できませんでした。',
    'page.title': 'ガイドツアー',
    'page.description':
      'どのツアーもいつでも再生できます。ログイン時に開始するツアーは、初回ログイン時に自動的に始まります。',
    'page.empty': 'ガイドツアーはインストールされていません。',
    'page.steps': '{{n}} ステップ',
    'page.start': '開始',
    'page.continue': '続行',
    'page.restart': '最初から',
    'page.resetAll': 'すべてのツアーをリセット',
    'page.resetAllTitle': 'すべてのツアーをリセットしますか？',
    'page.resetAllBody':
      'すべてのツアーの進行状況が消去され、次回の訪問時にウェルカムツアーが再び再生されます。',
    'page.cancel': 'キャンセル',
    'page.confirm': 'リセット',
    'page.autoStartLogin': 'ログイン時に開始',
    'page.autoStartPath': '{{path}} の初回訪問時に開始',
    'page.status.new': '新規',
    'page.status.inProgress': '進行中',
    'page.status.completed': '完了',
    'page.status.dismissed': '却下',
  },
});

export default guidedToursTranslationJa;
