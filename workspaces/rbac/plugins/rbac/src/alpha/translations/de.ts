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
 * de translation for plugin.rbac.
 * @public
 */
const rbacTranslationDe = createTranslationMessages({
  ref: rbacTranslationRef,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'Rolle erstellen',
    'page.editRole': 'Rolle bearbeiten',
    'table.searchPlaceholder': 'Filter',
    'table.labelRowsSelect': 'Zeilen',
    'table.title': 'Alle Rollen',
    'table.titleWithCount': 'Alle Rollen ({{count}})',
    'table.headers.name': 'Name',
    'table.headers.usersAndGroups': 'Benutzer und Gruppen',
    'table.headers.accessiblePlugins': 'Barrierefreie Plugins',
    'table.headers.actions': 'Aktionen',
    'table.defaultRoleUsersAndGroups': 'Alle Benutzer und alle Gruppen',
    'table.emptyContent': 'Keine Datensätze gefunden',
    'toolbar.createButton': 'Erstellen',
    'toolbar.warning.title': 'Rolle konnte nicht erstellt werden.',
    'toolbar.warning.message':
      "Um die Schaltfläche 'Rolle erstellen/bearbeiten' zu aktivieren, stellen Sie sicher, dass die erforderlichen Benutzer/Gruppen im Katalog vorhanden sind, da eine Rolle nicht ohne Benutzer/Gruppen erstellt werden kann. Außerdem muss die Ihrem Benutzer zugeordnete Rolle über die genannten Berechtigungsrichtlinien verfügen. <link>hier</link>.",
    'toolbar.warning.linkText': 'hier',
    'toolbar.warning.note': 'Hinweis',
    'toolbar.warning.noteText':
      "Wenn selbst nach der Aufnahme von Benutzern/Gruppen in den Katalog und nach Anwendung der o. g. Berechtigungen die Schaltfläche 'Erstellen/Bearbeiten' weiterhin deaktiviert ist, wenden Sie sich an den Administrator, da Ihr Zugriff auf die Schaltfläche 'Erstellen/Bearbeiten' möglicherweise bedingt eingeschränkt ist.",
    'errors.notFound': 'Nicht gefunden',
    'errors.notAllowed':
      'Unzureichende Berechtigungen zum Zugriff auf diese Seite',
    'errors.unauthorized': 'Keine Berechtigung zum Erstellen der Rolle',
    'errors.rbacDisabled':
      'Aktivieren Sie das RBAC-Backend-Plugin, um diese Funktion zu nutzen.',
    'errors.rbacDisabledInfo':
      "Um RBAC zu aktivieren, setzen Sie 'permission.enabled' in der 'app-config'-Datei auf 'true'.",
    'errors.fetchRoles': 'Beim Abrufen der Rollen ist ein Fehler aufgetreten',
    'errors.fetchRole': 'Beim Abrufen der Rolle ist ein Fehler aufgetreten',
    'errors.fetchPoliciesErr': 'Fehler beim Abrufen der Richtlinien. {{error}}',
    'errors.fetchPolicies':
      'Beim Abrufen der Berechtigungsrichtlinien ist ein Fehler aufgetreten',
    'errors.fetchPlugins': 'Fehler beim Abrufen der Plugins. {{error}}',
    'errors.fetchConditionalPermissionPolicies':
      'Fehler beim Abrufen der bedingten Berechtigungsrichtlinien. {{error}}',
    'errors.fetchConditions':
      'Beim Abrufen der Rollenbedingungen ist ein Fehler aufgetreten',
    'errors.fetchUsersAndGroups':
      'Beim Abrufen der Benutzer und Gruppen ist ein Fehler aufgetreten',
    'errors.createRole': 'Die Rolle kann nicht erstellt werden.',
    'errors.editRole': 'Die Rolle kann nicht bearbeitet werden.',
    'errors.deleteRole': 'Die Rolle kann nicht gelöscht werden.',
    'errors.defaultRoleReadOnly': 'Standardrolle ist schreibgeschützt.',
    'errors.roleCreatedSuccess':
      'Die Rolle wurde erfolgreich erstellt, es können jedoch keine Berechtigungsrichtlinien zur Rolle hinzugefügt werden.',
    'errors.roleCreatedConditionsSuccess':
      'Die Rolle wurde erfolgreich erstellt, es können jedoch keine Bedingungen zur Rolle hinzugefügt werden.',
    'roleForm.titles.createRole': 'Rolle erstellen',
    'roleForm.titles.editRole': 'Rolle bearbeiten',
    'roleForm.titles.nameAndDescription':
      'Name, Beschreibung und Eigentümer der Rolle eingeben',
    'roleForm.titles.usersAndGroups': 'Benutzer und Gruppen hinzufügen',
    'roleForm.titles.permissionPolicies': 'Berechtigungsrichtlinien hinzufügen',
    'roleForm.review.reviewAndCreate': 'Überprüfen und erstellen',
    'roleForm.review.reviewAndSave': 'Überprüfen und speichern',
    'roleForm.review.nameDescriptionOwner':
      'Name, Beschreibung und Eigentümer der Rolle',
    'roleForm.review.permissionPoliciesWithCount':
      'Berechtigungsrichtlinien ({{count}})',
    'roleForm.steps.next': 'Weiter',
    'roleForm.steps.back': 'Zurück',
    'roleForm.steps.cancel': 'Abbrechen',
    'roleForm.steps.reset': 'Zurücksetzen',
    'roleForm.steps.create': 'Erstellen',
    'roleForm.steps.save': 'Speichern',
    'roleForm.fields.name.label': 'Name',
    'roleForm.fields.name.helperText': 'Geben Sie den Namen der Rolle ein',
    'roleForm.fields.description.label': 'Beschreibung',
    'roleForm.fields.description.helperText':
      'Optional: Geben Sie eine kurze Beschreibung der Rolle ein (Zweck der Rolle)',
    'roleForm.fields.owner.label': 'Eigentümer',
    'roleForm.fields.owner.helperText':
      'Optional: Geben Sie einen Benutzer oder eine Gruppe ein, der bzw. die die Berechtigung haben soll, diese Rolle zu bearbeiten und zusätzliche Rollen zu erstellen. Im nächsten Schritt legen Sie fest, welchen Benutzern sie ihre Rollen zuweisen können und auf welche Plugins sie Zugriff erteilen können. Wird hier keine Angabe gemacht, wird bei der Erstellung automatisch der Autor zugewiesen.',
    'deleteDialog.title': 'Rolle löschen',
    'deleteDialog.question': 'Diese Rolle löschen?',
    'deleteDialog.confirmation':
      'Möchten Sie die Rolle **{{roleName}}** wirklich löschen? Das Löschen dieser Rolle ist unumkehrbar und entfernt deren Funktionalität aus dem System. Gehen Sie mit Vorsicht vor. Das mit dieser Rolle verbundene **{{member}}** verliert den Zugriff auf alle in dieser Rolle festgelegten **{{permissions}}-Berechtigungsrichtlinien**.',
    'deleteDialog.roleNameLabel': 'Rollenname',
    'deleteDialog.roleNameHelper':
      'Geben Sie den Namen der Rolle ein, um zu bestätigen',
    'deleteDialog.deleteButton': 'Löschen',
    'deleteDialog.cancelButton': 'Abbrechen',
    'deleteDialog.successMessage': 'Rolle {{roleName}} erfolgreich gelöscht',
    'snackbar.success': 'Erfolg',
    'dialog.cancelRoleCreation': 'Rollenerstellung abbrechen',
    'dialog.exitRoleCreation': 'Rollenerstellung beenden?',
    'dialog.exitRoleEditing': 'Rollenbearbeitung beenden?',
    'dialog.exitWarning':
      '\n\nWenn Sie diese Seite verlassen, werden die von Ihnen eingegebenen Informationen endgültig verworfen. Möchten Sie wirklich beenden?',
    'dialog.discard': 'Verwerfen',
    'dialog.cancel': 'Abbrechen',
    'conditionalAccess.condition': 'Bedingung',
    'conditionalAccess.allOf': 'Alle von',
    'conditionalAccess.anyOf': 'Beliebige von',
    'conditionalAccess.not': 'Nicht',
    'conditionalAccess.addNestedCondition':
      'Verschachtelte Bedingungen hinzufügen',
    'conditionalAccess.addRule': 'Regel hinzufügen',
    'conditionalAccess.nestedConditionTooltip':
      'Verschachtelte Bedingungen sind **Regeln der Ebene 1 innerhalb einer Hauptbedingung**. Dies ermöglicht es Ihnen, entsprechenden Zugriff durch detaillierte Berechtigungen auf Basis verschiedener Bedingungen zu gewähren. Sie können mehrere verschachtelte Bedingungen hinzufügen.',
    'conditionalAccess.nestedConditionExample':
      'Beispielsweise können Sie in der Hauptbedingung den Zugriff auf alle Elementtypen erlauben und mithilfe einer verschachtelten Bedingung den Zugriff auf die dem Benutzer gehörenden Elemente beschränken.',
    'permissionPolicies.helperText':
      'Standardmäßig haben Benutzer keinen Zugriff auf Plugins. Um Benutzern Zugriff zu gewähren, wählen Sie die Plugins aus, die Sie ermöglichen möchten. Wählen Sie anschließend aus, für welche Aktionen Sie dem Benutzer die Berechtigung erteilen möchten.',
    'permissionPolicies.allPlugins': 'Alle Plugins ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      'Fehler beim Abrufen der Berechtigungsrichtlinien: {{error}}',
    'permissionPolicies.resourceTypeTooltip': 'Ressourcentyp: {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      'Verwenden Sie erweiterte, angepasste Berechtigungen, um den Zugriff auf bestimmte Teile des ausgewählten Ressourcentyps zu ermöglichen.',
    'permissionPolicies.noAdvancedPermissionsTooltip':
      'Erweiterte Anpassungsmöglichkeiten werden für diesen Ressourcentyp nicht unterstützt.',
    'permissionPolicies.pluginsSelected': '{{count}} Plugins',
    'permissionPolicies.noPluginsSelected': 'Keine Plugins ausgewählt',
    'permissionPolicies.search': 'Suchen',
    'permissionPolicies.noRecordsToDisplay':
      'Keine Datensätze zum Anzeigen vorhanden.',
    'permissionPolicies.selectedPluginsAppearHere':
      'Ausgewählte Plugins werden hier angezeigt.',
    'permissionPolicies.selectPlugins': 'Plugins auswählen',
    'permissionPolicies.noPluginsFound': 'Keine Plugins gefunden.',
    'permissionPolicies.plugin': 'Plugin',
    'permissionPolicies.permission': 'Berechtigung',
    'permissionPolicies.policies': 'Richtlinien',
    'permissionPolicies.conditional': 'Bedingt',
    'permissionPolicies.rules': 'Regeln',
    'permissionPolicies.rule': 'Regel',
    'permissionPolicies.permissionPolicies': 'Berechtigungsrichtlinien',
    'permissionPolicies.permissions': 'Berechtigungen',
    'common.noResults':
      'Für diesen Datumsbereich wurden keine Ergebnisse gefunden.',
    'common.exportCSV': 'CSV exportieren',
    'common.csvFilename': 'data-export.csv',
    'common.noMembers': 'Keine Mitglieder',
    'common.groups': 'Gruppen',
    'common.group': 'Gruppe',
    'common.users': 'Benutzer',
    'common.user': 'Benutzer',
    'common.use': 'Verwenden',
    'common.refresh': 'Aktualisieren',
    'common.edit': 'Bearbeiten',
    'common.unauthorizedToEdit': 'Keine Berechtigung zum Bearbeiten',
    'common.noRecordsFound': 'Keine Datensätze gefunden',
    'common.selectUsersAndGroups': 'Benutzer und Gruppen auswählen',
    'common.clearSearch': 'Suche löschen',
    'common.closeDrawer': 'Drawer schließen',
    'common.remove': 'Entfernen',
    'common.addRule': 'Regel hinzufügen',
    'common.selectRule': 'Wählen Sie eine Regel aus',
    'common.rule': 'Regel',
    'common.removeNestedCondition': 'Verschachtelte Bedingung entfernen',
    'common.overview': 'Übersicht',
    'common.about': 'Info',
    'common.description': 'Beschreibung',
    'common.modifiedBy': 'Geändert von',
    'common.lastModified': 'Zuletzt geändert',
    'common.owner': 'Eigentümer',
    'common.noUsersAndGroupsSelected': 'Keine Benutzer und Gruppen ausgewählt',
    'common.selectedUsersAndGroupsAppearHere':
      'Ausgewählte Benutzer und Gruppen werden hier angezeigt.',
    'common.name': 'Name',
    'common.type': 'Typ',
    'common.members': 'Mitglieder',
    'common.actions': 'Aktionen',
    'common.removeMember': 'Mitglied entfernen',
    'common.delete': 'Löschen',
    'common.deleteRole': 'Rolle löschen',
    'common.update': 'Aktualisieren',
    'common.editRole': 'Rolle bearbeiten',
    'common.checkingPermissions': 'Berechtigungen werden überprüft…',
    'common.unauthorizedTo': 'Nicht berechtigt für {{action}}',
    'common.performThisAction': 'Ausführen dieser Aktion',
    'common.unableToCreatePermissionPolicies':
      'Die Berechtigungsrichtlinien konnten nicht erstellt werden.',
    'common.unableToDeletePermissionPolicies':
      'Die Berechtigungsrichtlinien konnten nicht gelöscht werden.',
    'common.unableToRemoveConditions':
      'Die Bedingungen konnten nicht aus der Rolle entfernt werden.',
    'common.unableToUpdateConditions':
      'Die Bedingungen konnten nicht aktualisiert werden.',
    'common.unableToAddConditions':
      'Der Rolle konnten keine Bedingungen hinzugefügt werden.',
    'common.roleActionSuccessfully':
      '{{action}} für Rolle {{roleName}} erfolgreich',
    'common.unableToFetchRole':
      'Rolle konnte nicht abgerufen werden: {{error}}',
    'common.unableToFetchMembers':
      'Mitglieder konnten nicht abgerufen werden: {{error}}',
    'common.roleAction': '{{action}} für Rolle',
    'common.membersCount': '{{count}} Mitglieder',
    'common.parentGroupCount': '{{count}} übergeordnete Gruppe',
    'common.childGroupsCount': '{{count}} untergeordnete Gruppen',
    'common.searchAndSelectUsersGroups':
      'Suchen und wählen Sie Benutzer und Gruppen aus, die hinzugefügt werden sollen. Ausgewählte Benutzer und Gruppen werden in der folgenden Tabelle angezeigt.',
    'common.noUsersAndGroupsFound': 'Keine Benutzer und Gruppen gefunden.',
    'common.errorFetchingUserGroups':
      'Fehler beim Abrufen von Benutzern und Gruppen: {{error}}',
    'common.nameRequired': 'Name ist erforderlich',
    'common.noMemberSelected': 'Kein Mitglied ausgewählt',
    'common.noPluginSelected': 'Kein Plugin ausgewählt',
    'common.pluginRequired': 'Plugin ist erforderlich',
    'common.permissionRequired': 'Berechtigung ist erforderlich',
    'common.editCell': 'Bearbeiten...',
    'common.selectCell': 'Auswählen...',
    'common.expandRow': 'Zeile erweitern',
    'common.configureAccessFor': 'Zugriff konfigurieren für',
    'common.defaultResourceTypeVisible':
      'Standardmäßig ist der ausgewählte Ressourcentyp für alle hinzugefügten Benutzer sichtbar. Wenn Sie bestimmte Plugin-Regeln einschränken oder Berechtigungen dafür erteilen möchten, wählen Sie diese aus, und fügen Sie die Parameter hinzu.',
  },
});

export default rbacTranslationDe;
