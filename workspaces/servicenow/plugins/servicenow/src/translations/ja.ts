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
import { servicenowTranslationRef } from './ref';

/**
 * Japanese translation for plugin.servicenow.
 * @public
 */
const servicenowTranslationJa = createTranslationMessages({
  ref: servicenowTranslationRef,
  messages: {
    'page.title': 'ServiceNow チケット',
    'page.titleWithCount': 'ServiceNow チケット ({{count}})',
    'filter.state': '状態',
    'filter.priority': '優先度',
    'priority.critical': '重大',
    'priority.high': '高',
    'priority.moderate': '中程度',
    'priority.low': '低',
    'priority.planning': '計画中',
    'incidentState.new': '新規',
    'incidentState.inProgress': '進行中',
    'incidentState.onHold': '保留中',
    'incidentState.resolved': '解決済み',
    'incidentState.closed': 'クローズ済み',
    'incidentState.cancelled': 'キャンセル済み',
    'errors.loadingIncidents':
      'インシデントの読み込み中にエラーが発生: {{error}}',
    'table.searchPlaceholder': '検索',
    'table.labelRowsSelect': '{{count}} 行',
    'table.columns.incidentNumber': 'インシデント番号',
    'table.columns.description': '説明',
    'table.columns.created': '作成済み',
    'table.columns.priority': '優先度',
    'table.columns.state': '状態',
    'table.columns.actions': 'アクション',
    'table.emptyContent': 'レコードが見つかりません',
    'actions.openInServicenow': 'ServiceNow で開く',
  },
});

export default servicenowTranslationJa;
