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
import { argocdTranslationRef } from './ref';

/**
 * Japanese translation for plugin.argocd.
 * @public
 */
const argocdTranslationJa = createTranslationMessages({
  ref: argocdTranslationRef,
  messages: {
    'appStatus.appHealthStatus.Healthy': '健全',
    'appStatus.appHealthStatus.Suspended': '一時停止中',
    'appStatus.appHealthStatus.Degraded': 'デグレード',
    'appStatus.appHealthStatus.Progressing': '進行中',
    'appStatus.appHealthStatus.Missing': 'なし',
    'appStatus.appHealthStatus.Unknown': '不明',
    'appStatus.appSyncStatus.Unknown': '不明',
    'appStatus.appSyncStatus.Synced': '同期済み',
    'appStatus.appSyncStatus.OutOfSync': '同期なし',
    'common.appServer.title':
      'これは、Argo CD がインストールされているローカルクラスターです。',
    'common.permissionAlert.alertTitle': '権限が必要',
    'common.permissionAlert.alertText':
      'argocd プラグインを表示するには、管理者に連絡して argocd.view.read 権限を付与してもらうよう依頼してください。',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.name': '名前',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.kind': '種類',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.createdAt':
      '作成日時',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.syncStatus':
      '同期ステータス',
    'deploymentLifecycle.sidebar.resources.resourcesColumnHeader.healthStatus':
      '健全性ステータス',
    'deploymentLifecycle.sidebar.resources.resourcesTable.ariaLabelledBy':
      'リソース',
    'deploymentLifecycle.sidebar.resources.resourcesTable.noneFound':
      'リソースが見つかりません',
    'deploymentLifecycle.sidebar.resources.resourcesTableRow.ariaLabel':
      '行を展開',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistory.bodyText':
      'デプロイメント履歴',
    'deploymentLifecycle.sidebar.resources.resource.deploymentHistoryCommit.deployedText':
      'デプロイ済み',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.title':
      'イメージ',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.metadataItemWithTooltip.tooltipText':
      'これらは、ArgoCD アプリケーションの全デプロイメントで使用されているイメージです。',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.namespace':
      '名前空間',
    'deploymentLifecycle.sidebar.resources.resource.deploymentMetadata.commit':
      'コミット',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.namespace':
      '名前空間',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.strategy':
      'ストラテジー',
    'deploymentLifecycle.sidebar.resources.resource.rolloutMetadata.status':
      'ステータス',
    'deploymentLifecycle.sidebar.resources.resource.resourceMetadata.namespace':
      '名前空間',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.iconButton.ariaLabel':
      '詳細',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.refresh':
      '更新',
    'deploymentLifecycle.sidebar.resources.resourcesKebabMenuOptions.sync':
      '同期',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.placeholder':
      '種類で検索',
    'deploymentLifecycle.sidebar.resources.resourcesSearchBar.ariaLabel':
      '検索のクリア',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SearchByName':
      '名前',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Kind':
      '種類',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.SyncStatus':
      '同期ステータス',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.HealthStatus':
      '健全性ステータス',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.Unset':
      'フィルタリング条件',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.searchByNameInput':
      '名前で検索',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusInput':
      '健全性ステータスでフィルタリング',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusInput':
      '同期ステータスでフィルタリング',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.kindInput':
      '種類でフィルタリング',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.resourceFilters':
      'リソースフィルター',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.syncStatus':
      '同期ステータス',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.ariaLabels.kind':
      '種類',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Healthy':
      '健全',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Suspended':
      '一時停止中',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Degraded':
      'デグレード',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Progressing':
      '進行中',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Missing':
      'なし',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.healthStatusSelectOptions.Unknown':
      '不明',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Synced':
      '同期済み',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.Unknown':
      '不明',
    'deploymentLifecycle.sidebar.resources.filters.resourcesFilterBy.syncStatusSelectOptions.OutOfSync':
      '同期なし',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.textPrimary':
      '分析実行',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.name':
      '名前:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.createdAt':
      '作成日時:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.status':
      'ステータス:',
    'deploymentLifecycle.sidebar.rollouts.revisions.analysisRuns.analysisRuns.chipLabel':
      '分析',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.revision':
      'リビジョン',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.stable':
      '安定',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.active':
      'アクティブ',
    'deploymentLifecycle.sidebar.rollouts.revisions.blueGreenRevision.preview':
      'プレビュー',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revision':
      'リビジョン',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.stable':
      '安定',
    'deploymentLifecycle.sidebar.rollouts.revisions.canaryRevision.revisionType.canary':
      'カナリア',
    'deploymentLifecycle.sidebar.rollouts.revisions.revisionImage.textPrimary':
      'イメージへのトラフィック',
    'deploymentLifecycle.sidebar.rollouts.rollOut.title': 'リビジョン',
    'deploymentLifecycle.deploymentLifecycle.title':
      'デプロイメントライフサイクル',
    'deploymentLifecycle.deploymentLifecycle.subtitle':
      'ArgoCD プラグインを使用して、namespace にデプロイされたコンポーネント/システムをレビューします',
    'deploymentLifecycle.deploymentLifecycleCard.instance': 'インスタンス',
    'deploymentLifecycle.deploymentLifecycleCard.server': 'サーバー',
    'deploymentLifecycle.deploymentLifecycleCard.namespace': '名前空間',
    'deploymentLifecycle.deploymentLifecycleCard.commit': 'コミット',
    'deploymentLifecycle.deploymentLifecycleCard.tooltipText':
      '下に表示されているコミット SHA は、最初に定義されたアプリケーションソースの最新のコミットです。',
    'deploymentLifecycle.deploymentLifecycleCard.resources': 'リソース',
    'deploymentLifecycle.deploymentLifecycleCard.resourcesDeployed':
      'デプロイ済みリソース',
    'deploymentLifecycle.deploymentLifecycleDrawer.iconButtonTitle':
      'ドロワーを閉じる',
    'deploymentLifecycle.deploymentLifecycleDrawer.instance': 'インスタンス',
    'deploymentLifecycle.deploymentLifecycleDrawer.cluster': 'クラスター',
    'deploymentLifecycle.deploymentLifecycleDrawer.namespace': '名前空間',
    'deploymentLifecycle.deploymentLifecycleDrawer.commit': 'コミット',
    'deploymentLifecycle.deploymentLifecycleDrawer.revision': 'リビジョン',
    'deploymentLifecycle.deploymentLifecycleDrawer.resources': 'リソース',
    'deploymentLifecycle.deploymentLifecycleDrawer.instanceDefaultValue':
      'デフォルト',
    'deploymentSummary.deploymentSummary.tableTitle': 'デプロイメントの概要',
    'deploymentSummary.deploymentSummary.columns.application':
      'アプリケーション',
    'deploymentSummary.deploymentSummary.columns.namespace': '名前空間',
    'deploymentSummary.deploymentSummary.columns.instance': 'インスタンス',
    'deploymentSummary.deploymentSummary.columns.server': 'サーバー',
    'deploymentSummary.deploymentSummary.columns.revision': 'リビジョン',
    'deploymentSummary.deploymentSummary.columns.lastDeployed':
      '最終デプロイメント',
    'deploymentSummary.deploymentSummary.columns.syncStatus': '同期ステータス',
    'deploymentSummary.deploymentSummary.columns.healthStatus':
      '健全性ステータス',
  },
});

export default argocdTranslationJa;
