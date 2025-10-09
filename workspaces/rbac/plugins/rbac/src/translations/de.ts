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

const rbacTranslationDe = createTranslationMessages({
  ref: rbacTranslationRef,
  full: true,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'Rolle erstellen',
    'page.editRole': 'Rolle bearbeiten',
    'table.title': 'Alle Rollen',
    'table.titleWithCount': 'Alle Rollen ({{count}})',
    'table.headers.name': 'Name',
    'table.headers.usersAndGroups': 'Benutzer und Gruppen',
    'table.headers.accessiblePlugins': 'Zugängliche Plugins',
    'table.headers.actions': 'Aktionen',
    'table.emptyContent': 'Keine Datensätze gefunden',
    'table.searchPlaceholder': 'Filtern',
    'table.labelRowsSelect': 'Zeilen',
    'toolbar.createButton': 'Erstellen',
    'toolbar.warning.title': 'Rolle kann nicht erstellt werden.',
    'toolbar.warning.message':
      'Um die Schaltfläche Rolle erstellen/bearbeiten zu aktivieren, stellen Sie sicher, dass die erforderlichen Benutzer/Gruppen im Katalog verfügbar sind, da eine Rolle nicht ohne Benutzer/Gruppen erstellt werden kann, und dass die Rolle, die mit Ihrem Benutzer verknüpft ist, die Berechtigungsrichtlinien <link>hier</link> erwähnt.',
    'toolbar.warning.linkText': 'hier',
    'toolbar.warning.note': 'Hinweis',
    'toolbar.warning.noteText':
      'Selbst nach dem Importieren von Benutzern/Gruppen in den Katalog und dem Anwenden der oben genannten Berechtigungen, wenn die Erstellen/Bearbeiten-Schaltfläche weiterhin deaktiviert ist, wenden Sie sich bitte an Ihren Administrator, da Sie möglicherweise bedingt vom Zugriff auf die Erstellen/Bearbeiten-Schaltfläche eingeschränkt sind.',
    'errors.notFound': 'Nicht gefunden',
    'errors.unauthorized': 'Nicht berechtigt, Rolle zu erstellen',
    'errors.rbacDisabled':
      'Aktivieren Sie das RBAC-Backend-Plugin, um diese Funktion zu verwenden.',
    'errors.rbacDisabledInfo':
      'Um RBAC zu aktivieren, setzen Sie `permission.enabled` auf `true` in der App-Konfigurationsdatei.',
    'errors.fetchRoles': 'Beim Abrufen der Rollen ist etwas schief gelaufen',
    'errors.fetchRole': 'Beim Abrufen der Rolle ist etwas schief gelaufen',
    'errors.fetchPolicies':
      'Beim Abrufen der Berechtigungsrichtlinien ist etwas schief gelaufen',
    'errors.fetchPoliciesErr': 'Fehler beim Abrufen der Richtlinien. {{error}}',
    'errors.fetchPlugins': 'Fehler beim Abrufen der Plugins. {{error}}',
    'errors.fetchConditionalPermissionPolicies':
      'Fehler beim Abrufen der bedingten Berechtigungsrichtlinien. {{error}}',
    'errors.fetchConditions':
      'Beim Abrufen der Rollenbedingungen ist etwas schief gelaufen',
    'errors.fetchUsersAndGroups':
      'Beim Abrufen der Benutzer und Gruppen ist etwas schief gelaufen',
    'errors.createRole': 'Rolle kann nicht erstellt werden.',
    'errors.editRole': 'Rolle kann nicht bearbeitet werden.',
    'errors.deleteRole': 'Rolle kann nicht gelöscht werden.',
    'errors.roleCreatedSuccess':
      'Rolle wurde erfolgreich erstellt, aber Berechtigungsrichtlinien konnten nicht zur Rolle hinzugefügt werden.',
    'errors.roleCreatedConditionsSuccess':
      'Rolle wurde erfolgreich erstellt, aber Bedingungen konnten nicht zur Rolle hinzugefügt werden.',
    'roleForm.titles.createRole': 'Rolle erstellen',
    'roleForm.titles.editRole': 'Rolle bearbeiten',
    'roleForm.titles.nameAndDescription':
      'Name und Beschreibung der Rolle eingeben',
    'roleForm.titles.usersAndGroups': 'Benutzer und Gruppen hinzufügen',
    'roleForm.titles.permissionPolicies': 'Berechtigungsrichtlinien hinzufügen',
    'roleForm.review.reviewAndCreate': 'Überprüfen und erstellen',
    'roleForm.review.reviewAndSave': 'Überprüfen und speichern',
    'roleForm.review.nameDescriptionOwner':
      'Name, Beschreibung und Eigentümer der Rolle',
    'roleForm.steps.next': 'Weiter',
    'roleForm.steps.back': 'Zurück',
    'roleForm.steps.cancel': 'Abbrechen',
    'roleForm.steps.reset': 'Zurücksetzen',
    'roleForm.steps.create': 'Erstellen',
    'roleForm.steps.save': 'Speichern',
    'roleForm.fields.name.label': 'Name',
    'roleForm.fields.name.helperText': 'Name der Rolle eingeben',
    'roleForm.fields.description.label': 'Beschreibung',
    'roleForm.fields.description.helperText':
      'Geben Sie eine kurze Beschreibung der Rolle ein (Der Zweck der Rolle)',
    'roleForm.fields.owner.label': 'Eigentümer',
    'roleForm.fields.owner.helperText':
      'Optional: Geben Sie einen Benutzer oder eine Gruppe ein, die die Berechtigung haben soll, diese Rolle zu bearbeiten und zusätzliche Rollen zu erstellen. Im nächsten Schritt geben Sie an, welche Benutzer sie ihren Rollen zuweisen können und auf welche Plugins sie Zugriff gewähren können. Wenn leer gelassen, wird automatisch der Autor bei der Erstellung zugewiesen.',
    'deleteDialog.title': 'Rolle löschen',
    'deleteDialog.question': 'Diese Rolle löschen?',
    'deleteDialog.confirmation':
      'Bist du sicher, dass du die Rolle **{{roleName}}** löschen möchtest?\n\nDas Löschen dieser Rolle ist irreversibel und entfernt ihre Funktionalität aus dem System. Bitte vorsichtig vorgehen.\n\nDie **{{members}}**, die mit dieser Rolle verbunden sind, verlieren den Zugriff auf alle in dieser Rolle angegebenen **{{permissions}} Berechtigungsrichtlinien**.',
    'deleteDialog.roleNameLabel': 'Rollenname',
    'deleteDialog.roleNameHelper':
      'Geben Sie den Namen der Rolle zur Bestätigung ein',
    'deleteDialog.deleteButton': 'Löschen',
    'deleteDialog.cancelButton': 'Abbrechen',
    'deleteDialog.successMessage': 'Rolle {{roleName}} erfolgreich gelöscht',
    'snackbar.success': 'Erfolg',
    'common.noResults': 'Keine Ergebnisse für diesen Zeitraum.',
    'common.exportCSV': 'CSV exportieren',
    'common.csvFilename': 'daten-export.csv',
    'common.noMembers': 'Keine Mitglieder',
    'common.groups': 'Gruppen',
    'common.group': 'Gruppe',
    'common.users': 'Benutzer',
    'common.user': 'Benutzer',
    'common.use': 'Verwenden',
    'common.refresh': 'Aktualisieren',
    'common.edit': 'Bearbeiten',
    'common.unauthorizedToEdit': 'Nicht berechtigt zu bearbeiten',
    'common.noRecordsFound': 'Keine Datensätze gefunden',
    'common.selectUsersAndGroups': 'Benutzer und Gruppen auswählen',
    'common.clearSearch': 'Suche löschen',
    'common.closeDrawer': 'Schublade schließen',
    'common.remove': 'Entfernen',
    'common.addRule': 'Regel hinzufügen',
    'common.selectRule': 'Eine Regel auswählen',
    'common.rule': 'Regel',
    'common.removeNestedCondition': 'Verschachtelte Bedingung entfernen',
    'common.overview': 'Übersicht',
    'common.about': 'Über',
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
    'common.unauthorizedTo': 'Nicht autorisiert für {{action}}',
    'common.performThisAction': 'diese Aktion ausführen',
    'common.unableToCreatePermissionPolicies':
      'Berechtigungsrichtlinien können nicht erstellt werden.',
    'common.unableToDeletePermissionPolicies':
      'Berechtigungsrichtlinien können nicht gelöscht werden.',
    'common.unableToRemoveConditions':
      'Bedingungen können nicht von der Rolle entfernt werden.',
    'common.unableToUpdateConditions':
      'Bedingungen können nicht aktualisiert werden.',
    'common.unableToAddConditions':
      'Bedingungen können nicht zur Rolle hinzugefügt werden.',
    'common.roleActionSuccessfully':
      'Rolle {{roleName}} {{action}} erfolgreich',
    'common.unableToFetchRole': 'Rolle kann nicht abgerufen werden: {{error}}',
    'common.unableToFetchMembers':
      'Mitglieder können nicht abgerufen werden: {{error}}',
    'common.roleAction': '{{action}} Rolle',
    'common.membersCount': '{{count}} Mitglieder',
    'common.parentGroupCount': '{{count}} übergeordnete Gruppe',
    'common.childGroupsCount': '{{count}} untergeordnete Gruppen',
    'common.searchAndSelectUsersGroups':
      'Suchen und wählen Sie Benutzer und Gruppen aus, die hinzugefügt werden sollen. Ausgewählte Benutzer und Gruppen werden in der Tabelle unten angezeigt.',
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
      'Standardmäßig ist der ausgewählte Ressourcentyp für alle hinzugefügten Benutzer sichtbar. Wenn Sie den Zugriff einschränken oder Berechtigungen für bestimmte Plugin-Regeln gewähren möchten, wählen Sie diese aus und fügen Sie die Parameter hinzu.',
    'conditionalAccess.condition': 'Bedingung',
    'conditionalAccess.allOf': 'AllOf',
    'conditionalAccess.anyOf': 'AnyOf',
    'conditionalAccess.not': 'Not',
    'conditionalAccess.addNestedCondition':
      'Verschachtelte Bedingung hinzufügen',
    'conditionalAccess.addRule': 'Regel hinzufügen',
    'conditionalAccess.nestedConditionTooltip':
      'Verschachtelte Bedingungen sind **1-Layer-Regeln innerhalb einer Hauptbedingung**. Sie ermöglichen es Ihnen, angemessenen Zugriff zu gewähren, indem Sie detaillierte Berechtigungen basierend auf verschiedenen Bedingungen verwenden. Sie können mehrere verschachtelte Bedingungen hinzufügen.',
    'conditionalAccess.nestedConditionExample':
      'Sie können beispielsweise Zugriff auf alle Entitätstypen in der Hauptbedingung gewähren und eine verschachtelte Bedingung verwenden, um den Zugriff auf Entitäten zu beschränken, die dem Benutzer gehören.',
    'dialog.cancelRoleCreation': 'Rollenerstellung abbrechen',
    'dialog.exitRoleCreation': 'Rollenerstellung beenden?',
    'dialog.exitRoleEditing': 'Rollenbearbeitung beenden?',
    'dialog.exitWarning':
      '\n\nDas Verlassen dieser Seite verwirft dauerhaft die von Ihnen eingegebenen Informationen.\n\nMöchten Sie wirklich beenden?',
    'dialog.discard': 'Verwerfen',
    'dialog.cancel': 'Abbrechen',
    'permissionPolicies.helperText':
      'Standardmäßig erhalten Benutzer keinen Zugriff auf Plugins. Um Benutzerzugriff zu gewähren, wählen Sie die Plugins aus, die Sie aktivieren möchten. Wählen Sie dann aus, welche Aktionen Sie dem Benutzer erlauben möchten.',
    'permissionPolicies.allPlugins': 'Alle Plugins ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      'Fehler beim Abrufen der Berechtigungsrichtlinien: {{error}}',
    'permissionPolicies.resourceTypeTooltip': 'Ressourcentyp: {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      'Verwenden Sie erweiterte angepasste Berechtigungen, um Zugriff auf bestimmte Teile des ausgewählten Ressourcentyps zu gewähren.',
    'permissionPolicies.pluginsSelected': '{{count}} Plugins',
    'permissionPolicies.noPluginsSelected': 'Keine Plugins ausgewählt',
    'permissionPolicies.search': 'Suchen',
    'permissionPolicies.noRecordsToDisplay': 'Keine Datensätze anzuzeigen.',
    'permissionPolicies.selectedPluginsAppearHere':
      'Ausgewählte Plugins erscheinen hier.',
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
  },
});

export default rbacTranslationDe;
