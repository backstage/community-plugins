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

import { createTranslationMessages } from '@backstage/frontend-plugin-api';
import { topologyTranslationRef } from './ref';

/**
 * Japanese translation for plugin.topology.
 * @public
 */
const topologyTranslationJa = createTranslationMessages({
  ref: topologyTranslationRef,
  messages: {
    'page.title': 'トポロジー',
    'page.subtitle': 'Kubernetes ワークロードトポロジーの可視化',
    'toolbar.cluster': 'クラスター',
    'toolbar.selectCluster': 'クラスターを選択する',
    'toolbar.displayOptions': '表示オプション',
    'toolbar.currentDisplayOptions': '現在の表示オプション',
    'controlBar.zoomIn': '拡大',
    'controlBar.zoomOut': '縮小',
    'controlBar.fitToScreen': '画面に合わせる',
    'controlBar.resetView': 'ビューをリセットする',
    'emptyState.noResourcesFound': 'リソースが見つかりません',
    'emptyState.noResourcesDescription':
      '選択したクラスター内に Kubernetes リソースが見つかりませんでした。',
    'permissions.missingPermission': '権限がありません',
    'permissions.missingPermissionDescription':
      'トポロジーを表示するには、管理者から {{permissions}} {{permissionText}} を付与してもらう必要があります。',
    'permissions.missingPermissionDescription_plural':
      'トポロジーを表示するには、管理者から {{permissions}} {{permissionText}} を付与してもらう必要があります。',
    'permissions.permission': '権限',
    'permissions.permissions': '権限',
    'permissions.goBack': '戻る',
    'sideBar.details': '詳細',
    'sideBar.resources': 'リソース',
    'status.running': '実行中',
    'status.pending': '保留中',
    'status.succeeded': '成功',
    'status.failed': '失敗',
    'status.unknown': '不明',
    'status.terminating': '終了中',
    'status.crashLoopBackOff': 'CrashLoopBackOff',
    'status.error': 'エラー',
    'status.warning': '警告',
    'status.ready': '準備完了',
    'status.notReady': '準備未完了',
    'status.active': 'アクティブ',
    'status.inactive': '非アクティブ',
    'status.updating': '更新中',
    'status.evicted': 'エビクト済み',
    'status.cancelled': 'キャンセル済み',
    'details.name': '名前',
    'details.namespace': 'Namespace',
    'details.labels': 'ラベル',
    'details.annotations': 'アノテーション',
    'details.createdAt': '作成済み',
    'details.age': '経過時間',
    'details.replicas': 'レプリカ',
    'details.availableReplicas': '利用可能なレプリカ',
    'details.readyReplicas': '準備完了レプリカ',
    'details.updatedReplicas': '更新済みレプリカ',
    'details.selector': 'セレクター',
    'details.strategy': 'ストラテジー',
    'details.image': 'イメージ',
    'details.ports': 'ポート',
    'details.volumes': 'ボリューム',
    'details.volumeMounts': 'ボリュームマウント',
    'details.environmentVariables': '環境変数',
    'details.resourceRequirements': 'リソース要件',
    'details.limits': '制限',
    'details.requests': '要求',
    'details.cpu': 'CPU',
    'details.memory': 'メモリー',
    'details.storage': 'ストレージ',
    'details.noLabels': 'ラベルなし',
    'details.noAnnotations': 'アノテーションなし',
    'details.noOwner': 'オーナーなし',
    'details.notAvailable': '利用不可',
    'details.notConfigured': '未設定',
    'details.updateStrategy': '更新ストラテジー',
    'details.maxUnavailable': '最大利用不可数',
    'details.maxSurge': '最大サージ数',
    'details.progressDeadlineSeconds': '進捗状況の期限 (秒)',
    'details.minReadySeconds': '最小の準備状態 (秒)',
    'details.desiredCompletions': '目的の完了数',
    'details.parallelism': '並列数',
    'details.activeDeadlineSeconds': '有効な期限 (秒)',
    'details.currentCount': '現在のカウント',
    'details.desiredCount': '目的のカウント',
    'details.schedule': 'スケジュール',
    'details.concurrencyPolicy': '同時実行ポリシー',
    'details.startingDeadlineSeconds': '起動の期限 (秒)',
    'details.lastScheduleTime': '最終スケジュール日時',
    'details.maxSurgeDescription': '{{replicas}} Pod より {{maxSurge}} 個多く',
    'details.maxUnavailableDescription':
      '{{replicas}} Pod のうち {{maxUnavailable}}',
    'logs.download': 'ダウンロード',
    'logs.noLogsFound': 'ログが見つかりません',
    'logs.selectContainer': 'コンテナーを選択する',
    'logs.container': 'コンテナー',
    'logs.pod': 'Pod',
    'logs.showPrevious': '前の項目を表示する',
    'logs.follow': 'フォローする',
    'logs.refresh': '更新',
    'logs.timestamps': 'タイムスタンプ',
    'logs.wrapLines': '行の折り返し',
    'logs.clearLogs': 'ログをクリアする',
    'logs.logLevel': 'ログレベル',
    'logs.search': '検索',
    'logs.noMatchingLogs': '一致するログが見つかりません',
    'resources.noResourcesFound':
      'このリソースに対応する {{resourceType}} が見つかりません。',
    'resources.showingLatest':
      '最新の {{count}} {{resourceType}} を表示しています',
    'time.seconds': '秒',
    'time.minutes': '分',
    'time.hours': '時間',
    'time.days': '日',
    'events.type': 'タイプ',
    'events.reason': '理由',
    'events.message': 'メッセージ',
    'events.source': 'ソース',
    'events.firstSeen': '初回検出',
    'events.lastSeen': '最終検出',
    'events.count': 'カウント',
    'events.noEventsFound': 'イベントが見つかりません',
    'filters.showLabels': 'ラベルを表示する',
    'filters.showPodCount': 'Pod 数を表示する',
    'filters.expandApplicationGroups': 'アプリケーショングループを展開する',
    'filters.showConnectors': 'コネクターを表示する',
    'common.status': 'ステータス',
    'common.owner': '所有者',
    'common.location': '場所',
    'common.viewLogs': 'ログの表示',
    'bootOrder.summary': 'ブート順序の概要',
    'bootOrder.emptySummary': 'ブート順序が設定されていません',
    'bootOrder.disk': 'ディスク',
    'bootOrder.network': 'ネットワーク',
    'bootOrder.cdrom': 'CD-ROM',
    'vm.status.starting': '起動中',
    'vm.status.stopping': '停止中',
    'vm.status.stopped': '停止済み',
    'vm.status.paused': '一時停止中',
    'vm.status.migrating': '移行中',
    'vm.status.provisioning': 'プロビジョニング',
    'vm.status.errorUnschedulable': 'ErrorUnschedulable',
    'vm.status.errorImagePull': 'ErrorImagePull',
    'vm.status.imageNotReady': 'ImageNotReady',
    'vm.status.waitingForVolumeBinding': 'WaitingForVolumeBinding',
  },
});

export default topologyTranslationJa;
