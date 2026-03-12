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
import { rbacTranslationRef } from './ref';

/**
 * Japanese translation for plugin.rbac.
 * @public
 */
const rbacTranslationJa = createTranslationMessages({
  ref: rbacTranslationRef,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'ロールの作成',
    'page.editRole': 'ロールの編集',
    'table.searchPlaceholder': 'フィルター',
    'table.labelRowsSelect': '行',
    'table.title': 'すべてのロール',
    'table.titleWithCount': 'すべてのロール ({{count}})',
    'table.headers.name': '名前',
    'table.headers.usersAndGroups': 'ユーザーとグループ',
    'table.headers.accessiblePlugins': 'アクセス可能なプラグイン',
    'table.headers.actions': 'アクション',
    'table.emptyContent': 'レコードが見つかりません',
    'toolbar.createButton': '作成',
    'toolbar.warning.title': 'ロールを作成できません。',
    'toolbar.warning.message':
      'ロールの作成/編集ボタンを有効にするには、必要なユーザー/グループがカタログで利用可能であることを確認してください。ユーザー/グループがないと、ロールを作成できないためです。また、ユーザーに関連付けられているロールには、次のリンク先に記載されている権限ポリシーが必要です <link>こちら</link>。',
    'toolbar.warning.linkText': 'こちら',
    'toolbar.warning.note': '注記',
    'toolbar.warning.noteText':
      'カタログにユーザー/グループを取り込み、上記の権限を適用した後でも作成/編集ボタンが無効な場合は、管理者に問い合わせてください。作成/編集ボタンへのアクセスが条件付きで制限されている可能性があります。',
    'errors.notFound': '見つかりません',
    'errors.notAllowed': 'このページにアクセスする権限が不足しています',
    'errors.unauthorized': 'ロールを作成する権限がありません',
    'errors.rbacDisabled':
      'この機能を使用するには、RBAC バックエンドプラグインを有効にしてください。',
    'errors.rbacDisabledInfo':
      'RBAC を有効にするには、app-config ファイルで `permission.enabled` を `true` に設定します。',
    'errors.fetchRoles': 'ロールの取得中に問題が発生しました',
    'errors.fetchRole': 'ロールの取得中に問題が発生しました',
    'errors.fetchPoliciesErr':
      'ポリシーの取得中にエラーが発生しました。{{error}}',
    'errors.fetchPolicies': '権限ポリシーの取得中に問題が発生しました',
    'errors.fetchPlugins':
      'プラグインの取得中にエラーが発生しました。{{error}}',
    'errors.fetchConditionalPermissionPolicies':
      '条件付き権限ポリシーの取得中にエラーが発生しました。{{error}}',
    'errors.fetchConditions': 'ロール条件の取得中に問題が発生しました',
    'errors.fetchUsersAndGroups':
      'ユーザーとグループの取得中に問題が発生しました',
    'errors.createRole': 'ロールを作成できません。',
    'errors.editRole': 'ロールを編集できません。',
    'errors.deleteRole': 'ロールを削除できません。',
    'errors.roleCreatedSuccess':
      'ロールが正常に作成されましたが、ロールに権限ポリシーを追加できません。',
    'errors.roleCreatedConditionsSuccess':
      'ロールは正常に作成されましたが、ロールに条件を追加できません。',
    'roleForm.titles.createRole': 'ロールの作成',
    'roleForm.titles.editRole': 'ロールの編集',
    'roleForm.titles.nameAndDescription':
      'ロールの名前と説明を入力してください',
    'roleForm.titles.usersAndGroups': 'ユーザーとグループの追加',
    'roleForm.titles.permissionPolicies': '権限ポリシーの追加',
    'roleForm.review.reviewAndCreate': '確認および作成',
    'roleForm.review.reviewAndSave': '確認および保存',
    'roleForm.review.nameDescriptionOwner': 'ロールの名前、説明、および所有者',
    'roleForm.review.permissionPoliciesWithCount': '権限ポリシー ({{count}})',
    'roleForm.steps.next': '次へ',
    'roleForm.steps.back': '戻る',
    'roleForm.steps.cancel': 'キャンセル',
    'roleForm.steps.reset': 'リセット',
    'roleForm.steps.create': '作成',
    'roleForm.steps.save': '保存',
    'roleForm.fields.name.label': '名前',
    'roleForm.fields.name.helperText': 'ロールの名前を入力してください',
    'roleForm.fields.description.label': '説明',
    'roleForm.fields.description.helperText':
      'ロールについての簡単な説明を入力してください (ロールの目的)',
    'roleForm.fields.owner.label': '所有者',
    'roleForm.fields.owner.helperText':
      '任意: このロールを編集する権限と追加のロールを作成する権限を持つユーザーまたはグループを入力してください。どのユーザーを自分のロールに割り当て可能にするか、どのプラグインへのアクセスを許可するかは、次のステップで設定します。空白のままにすると、作成時に作成者が自動的に割り当てられます。',
    'deleteDialog.title': 'ロールの削除',
    'deleteDialog.question': 'このロールを削除しますか?',
    'deleteDialog.confirmation':
      'ロール **{{roleName}}** を削除してもよろしいですか?このロールの削除は取り消せません。その機能もシステムから削除されます。慎重に操作してください。このロールに関連付けられている **{{members}}** が、このロールに指定されているすべての **{{permissions}} 権限ポリシー** にアクセスできなくなります。',
    'deleteDialog.roleNameLabel': 'ロール名',
    'deleteDialog.roleNameHelper': '確定するにはロールの名前を入力してください',
    'deleteDialog.deleteButton': '削除',
    'deleteDialog.cancelButton': 'キャンセル',
    'deleteDialog.successMessage': 'ロール {{roleName}} が正常に削除されました',
    'snackbar.success': '成功',
    'dialog.cancelRoleCreation': 'ロールの作成のキャンセル',
    'dialog.exitRoleCreation': 'ロールの作成を終了しますか?',
    'dialog.exitRoleEditing': 'ロールの編集を終了しますか?',
    'dialog.exitWarning':
      '\n\nこのページを終了すると、入力した情報が完全に破棄されます。終了してもよろしいですか?',
    'dialog.discard': '破棄',
    'dialog.cancel': 'キャンセル',
    'conditionalAccess.condition': '条件',
    'conditionalAccess.allOf': 'AllOf',
    'conditionalAccess.anyOf': 'AnyOf',
    'conditionalAccess.not': 'Not',
    'conditionalAccess.addNestedCondition': 'ネストされた条件の追加',
    'conditionalAccess.addRule': 'ルールの追加',
    'conditionalAccess.nestedConditionTooltip':
      'ネストされた条件とは、**メインの条件の中にある 1 階層分のルール** のことです。さまざまな条件に基づく詳細な権限を使用して、適切なアクセスを許可できます。ネストされた条件は複数追加できます。',
    'conditionalAccess.nestedConditionExample':
      'たとえば、メインの条件ですべてのエンティティータイプへのアクセスを許可し、ネストされた条件でユーザーが所有するエンティティーへのアクセスを制限できます。',
    'permissionPolicies.helperText':
      'デフォルトでは、ユーザーにはどのプラグインへのアクセスも許可されません。ユーザーのアクセスを許可するには、有効にするプラグインを選択します。その後、ユーザーに許可するアクションを選択します。',
    'permissionPolicies.allPlugins': 'すべてのプラグイン ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      '権限ポリシーの取得中にエラーが発生しました: {{error}}',
    'permissionPolicies.resourceTypeTooltip':
      'リソースタイプ: {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      '詳細にカスタマイズした権限を使用して、選択したリソースタイプの特定の部分へのアクセスを許可します。',
    'permissionPolicies.pluginsSelected': '{{count}} 個のプラグイン',
    'permissionPolicies.noPluginsSelected': 'プラグインが選択されていません',
    'permissionPolicies.search': '検索',
    'permissionPolicies.noRecordsToDisplay': '表示するレコードがありません。',
    'permissionPolicies.selectedPluginsAppearHere':
      '選択したプラグインがここに表示されます。',
    'permissionPolicies.selectPlugins': 'プラグインの選択',
    'permissionPolicies.noPluginsFound': 'プラグインが見つかりません。',
    'permissionPolicies.plugin': 'プラグイン',
    'permissionPolicies.permission': '権限',
    'permissionPolicies.policies': 'ポリシー',
    'permissionPolicies.conditional': '条件付き',
    'permissionPolicies.rules': 'ルール',
    'permissionPolicies.rule': 'ルール',
    'permissionPolicies.permissionPolicies': '権限ポリシー',
    'permissionPolicies.permissions': '権限',
    'common.noResults': 'この日付範囲の結果はありません。',
    'common.exportCSV': 'CSV エクスポート',
    'common.csvFilename': 'data-export.csv',
    'common.noMembers': 'メンバーがありません',
    'common.groups': 'グループ',
    'common.group': 'グループ',
    'common.users': 'ユーザー',
    'common.user': 'ユーザー',
    'common.use': '使用',
    'common.refresh': '更新',
    'common.edit': '編集',
    'common.unauthorizedToEdit': '編集権限がありません',
    'common.noRecordsFound': 'レコードが見つかりません',
    'common.selectUsersAndGroups': 'ユーザーとグループの選択',
    'common.clearSearch': '検索のクリア',
    'common.closeDrawer': 'ドロワーを閉じる',
    'common.remove': '削除',
    'common.addRule': 'ルールの追加',
    'common.selectRule': 'ルールの選択',
    'common.rule': 'ルール',
    'common.removeNestedCondition': 'ネストされた条件の削除',
    'common.overview': '概要',
    'common.about': '詳細情報',
    'common.description': '説明',
    'common.modifiedBy': '更新者',
    'common.lastModified': '最終更新',
    'common.owner': '所有者',
    'common.noUsersAndGroupsSelected': 'ユーザーとグループが選択されていません',
    'common.selectedUsersAndGroupsAppearHere':
      '選択したユーザーとグループがここに表示されます。',
    'common.name': '名前',
    'common.type': 'タイプ',
    'common.members': 'メンバー',
    'common.actions': 'アクション',
    'common.removeMember': 'メンバーの削除',
    'common.delete': '削除',
    'common.deleteRole': 'ロールの削除',
    'common.update': '更新',
    'common.editRole': 'ロールの編集',
    'common.checkingPermissions': '権限を確認しています…',
    'common.unauthorizedTo': '{{action}} 権限がありません',
    'common.performThisAction': 'このアクションの実行',
    'common.unableToCreatePermissionPolicies': '権限ポリシーを作成できません。',
    'common.unableToDeletePermissionPolicies': '権限ポリシーを削除できません。',
    'common.unableToRemoveConditions': 'ロールから条件を削除できません。',
    'common.unableToUpdateConditions': '条件を更新できません。',
    'common.unableToAddConditions': 'ロールに条件を追加できません。',
    'common.roleActionSuccessfully':
      'ロール {{roleName}} {{action}} が正常に実行されました',
    'common.unableToFetchRole': 'ロールを取得できません: {{error}}',
    'common.unableToFetchMembers': 'メンバーを取得できません: {{error}}',
    'common.roleAction': 'ロールの {{action}}',
    'common.membersCount': '{{count}} 人のメンバー',
    'common.parentGroupCount': '{{count}} 個の親グループ',
    'common.childGroupsCount': '{{count}} 個の子グループ',
    'common.searchAndSelectUsersGroups':
      '追加するユーザーとグループを検索して選択します。選択したユーザーとグループは下の表に表示されます。',
    'common.noUsersAndGroupsFound': 'ユーザーとグループが見つかりません。',
    'common.errorFetchingUserGroups':
      'ユーザーとグループの取得中にエラーが発生しました: {{error}}',
    'common.nameRequired': '名前は必須です',
    'common.noMemberSelected': 'メンバーが選択されていません',
    'common.noPluginSelected': 'プラグインが選択されていません',
    'common.pluginRequired': 'プラグインが必要です',
    'common.permissionRequired': '権限が必要です',
    'common.editCell': '編集...',
    'common.selectCell': '選択...',
    'common.expandRow': '行を展開',
    'common.configureAccessFor': '以下に対するアクセス権を設定',
    'common.defaultResourceTypeVisible':
      'デフォルトでは、選択したリソースタイプが、追加されたすべてのユーザーに表示されます。特定のプラグインルールに対する権限を制限または付与する場合は、そのルールを選択してパラメーターを追加してください。',
  },
});

export default rbacTranslationJa;
