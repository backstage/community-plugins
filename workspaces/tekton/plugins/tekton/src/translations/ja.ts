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
import { tektonTranslationRef } from './ref';

/**
 * Japanese translation for plugin.tekton.
 * @public
 */
const tektonTranslationJa = createTranslationMessages({
  ref: tektonTranslationRef,
  messages: {
    'errorPanel.title': 'Kubernetes オブジェクトの取得中に問題が発生しました',
    'errorPanel.description':
      'エンティティー {{entityName}} の一部の Kubernetes リソースの取得中に問題が発生しました。そのため、エラーレポートカードの表示が完全には正確でない可能性があります。',
    'permissionAlert.title': '権限が必要',
    'permissionAlert.description':
      'Tekton パイプライン実行を表示するには、管理者に連絡して次の権限を付与してもらうよう依頼してください: {{permissions}}。',
    'statusSelector.label': 'ステータス',
    'clusterSelector.label': 'クラスター',
    'tableExpandCollapse.collapseAll': 'すべて折りたたむ',
    'tableExpandCollapse.expandAll': 'すべて展開',
    'pipelineVisualization.emptyState.description':
      '視覚化するパイプライン実行がありません',
    'pipelineVisualization.noTasksDescription':
      'このパイプライン実行には視覚化するタスクがありません',
    'pipelineVisualization.stepList.finallyTaskTitle': 'Finally Task',
    'pipelineRunList.title': 'パイプライン実行',
    'pipelineRunList.noPipelineRuns': 'パイプライン実行が見つかりません',
    'pipelineRunList.searchBarPlaceholder': '検索',
    'pipelineRunList.rowActions.viewParamsAndResults':
      'パラメーターと結果の表示',
    'pipelineRunList.rowActions.viewLogs': 'ログの表示',
    'pipelineRunList.rowActions.unauthorizedViewLogs':
      'ログを表示する権限がありません',
    'pipelineRunList.rowActions.viewSBOM': 'SBOM の表示',
    'pipelineRunList.rowActions.SBOMNotApplicable':
      'この PipelineRun には SBOM の表示は適用されません',
    'pipelineRunList.rowActions.viewOutput': '出力の表示',
    'pipelineRunList.rowActions.outputNotApplicable':
      'この PipelineRun には出力の表示は適用されません',
    'pipelineRunList.vulnerabilitySeverityTitle.critical': '重大',
    'pipelineRunList.vulnerabilitySeverityTitle.high': '高',
    'pipelineRunList.vulnerabilitySeverityTitle.medium': '中',
    'pipelineRunList.vulnerabilitySeverityTitle.low': '低',
    'pipelineRunList.tableHeaderTitle.name': '名前',
    'pipelineRunList.tableHeaderTitle.vulnerabilities': '脆弱性',
    'pipelineRunList.tableHeaderTitle.status': '状態',
    'pipelineRunList.tableHeaderTitle.taskStatus': 'タスクステータス',
    'pipelineRunList.tableHeaderTitle.startTime': '開始済み',
    'pipelineRunList.tableHeaderTitle.duration': '期間',
    'pipelineRunList.tableHeaderTitle.actions': 'アクション',
    'pipelineRunList.tablePagination.rowsPerPageOptionLabel': '{{num}} 行',
    'pipelineRunLogs.title': 'PipelineRun ログ',
    'pipelineRunLogs.noLogs': 'ログが見つかりません',
    'pipelineRunLogs.downloader.downloadTaskLogs': 'ダウンロード',
    'pipelineRunLogs.downloader.downloadPipelineRunLogs':
      'すべてのタスクログのダウンロード',
    'pipelineRunLogs.podLogsDownloadLink.title': 'ダウンロード',
    'pipelineRunLogs.podLogsDownloadLink.downloading': 'ログのダウンロード中',
    'pipelineRunLogs.taskStatusStepper.skipped': 'スキップ済み',
    'pipelineRunOutput.title': 'PipelineRun 出力',
    'pipelineRunOutput.noOutput': '出力なし',
    'pipelineRunStatus.All': 'すべて',
    'pipelineRunStatus.Cancelling': 'キャンセル中',
    'pipelineRunStatus.Succeeded': '成功',
    'pipelineRunStatus.Failed': '失敗',
    'pipelineRunStatus.Running': '実行中',
    'pipelineRunStatus.In Progress': '進行中',
    'pipelineRunStatus.FailedToStart': 'FailedToStart',
    'pipelineRunStatus.PipelineNotStarted': 'PipelineNotStarted',
    'pipelineRunStatus.Skipped': 'スキップ済み',
    'pipelineRunStatus.Cancelled': 'キャンセル済み',
    'pipelineRunStatus.Pending': '保留中',
    'pipelineRunStatus.Idle': 'アイドル',
    'pipelineRunStatus.Other': 'その他',
    'pipelineRunDuration.lessThanSec': '1 秒未満',
    'pipelineRunDuration.hour_one': '{{count}} 時間',
    'pipelineRunDuration.hour_other': '{{count}} 時間',
    'pipelineRunDuration.minute_one': '{{count}} 分',
    'pipelineRunDuration.minute_other': '{{count}} 分',
    'pipelineRunDuration.second_one': '{{count}} 秒',
    'pipelineRunDuration.second_other': '{{count}} 秒',
    'pipelineRunParamsAndResults.title': 'PipelineRun のパラメーターと結果',
    'pipelineRunParamsAndResults.noParams': 'パラメーターが見つかりません',
    'pipelineRunParamsAndResults.noResults': '結果が見つかりません',
    'pipelineRunParamsAndResults.params': 'パラメーター',
    'pipelineRunParamsAndResults.results': '結果',
    'pipelineRunParamsAndResults.outputTableColumn.name': '名前',
    'pipelineRunParamsAndResults.outputTableColumn.value': '値',
  },
});

export default tektonTranslationJa;
