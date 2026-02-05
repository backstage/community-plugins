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
 * Italian translation for plugin.rbac.
 * @public
 */
const rbacTranslationIt = createTranslationMessages({
  ref: rbacTranslationRef,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'Crea ruolo',
    'page.editRole': 'Modifica ruolo',
    'table.searchPlaceholder': 'Filtra',
    'table.labelRowsSelect': 'Righe',
    'table.title': 'Tutti i ruoli',
    'table.titleWithCount': 'Tutti i ruoli ({{count}})',
    'table.headers.name': 'Nome',
    'table.headers.usersAndGroups': 'Utenti e gruppi',
    'table.headers.accessiblePlugins': 'Plugin accessibili',
    'table.headers.actions': 'Azioni',
    'table.emptyContent': 'Nessun record trovato',
    'toolbar.createButton': 'Crea',
    'toolbar.warning.title': 'Impossibile creare il ruolo.',
    'toolbar.warning.message':
      "Per abilitare il pulsante Crea/Modifica ruolo, verificare che gli utenti/gruppi richiesti siano disponibili nel catalogo perché non è possibile creare un ruolo senza utenti/gruppi; inoltre il ruolo associato all'utente deve disporre dei criteri di autorizzazione menzionati <link>qui</link>.",
    'toolbar.warning.linkText': 'qui',
    'toolbar.warning.note': 'Nota',
    'toolbar.warning.noteText':
      "Anche dopo aver inserito utenti/gruppi nel catalogo e applicato le autorizzazioni precedenti, se il pulsante Crea/Modifica è ancora disabilitato, contattare l'amministratore poiché potrebbero essere presenti limitazioni condizionali all'accesso al pulsante Crea/Modifica.",
    'errors.notFound': 'Non trovato',
    'errors.notAllowed': 'Permessi insufficienti per accedere a questa pagina',
    'errors.unauthorized': 'Nessuna autorizzazione a creare un ruolo',
    'errors.rbacDisabled':
      'Abilitare il plugin backend RBAC per utilizzare questa funzionalità.',
    'errors.rbacDisabledInfo':
      'Per abilitare RBAC, impostare `permission.enabled` su `true` nel file app-config.',
    'errors.fetchRoles':
      'Si è verificato un errore durante il recupero dei ruoli',
    'errors.fetchRole':
      'Si è verificato un errore durante il recupero del ruolo',
    'errors.fetchPoliciesErr':
      'Errore durante il recupero dei criteri. {{error}}',
    'errors.fetchPolicies':
      'Si è verificato un problema durante il recupero delle policy di autorizzazione',
    'errors.fetchPlugins': 'Errore durante il recupero dei plugin. {{error}}',
    'errors.fetchConditionalPermissionPolicies':
      'Errore durante il recupero dei criteri di autorizzazione condizionale. {{error}}',
    'errors.fetchConditions':
      'Si è verificato un errore durante il recupero delle condizioni del ruolo',
    'errors.fetchUsersAndGroups':
      'Si è verificato un problema durante il recupero degli utenti e dei gruppi',
    'errors.createRole': 'Impossibile creare il ruolo.',
    'errors.editRole': 'Impossibile modificare il ruolo.',
    'errors.deleteRole': 'Impossibile eliminare il ruolo.',
    'errors.roleCreatedSuccess':
      'Il ruolo è stato creato correttamente ma non è possibile aggiungere criteri di autorizzazione al ruolo.',
    'errors.roleCreatedConditionsSuccess':
      'Ruolo creato correttamente ma non è possibile aggiungere condizioni al ruolo.',
    'roleForm.titles.createRole': 'Crea ruolo',
    'roleForm.titles.editRole': 'Modifica ruolo',
    'roleForm.titles.nameAndDescription':
      'Inserire il nome e la descrizione del ruolo',
    'roleForm.titles.usersAndGroups': 'Aggiungi utenti e gruppi',
    'roleForm.titles.permissionPolicies': 'Aggiungi criteri di autorizzazione',
    'roleForm.review.reviewAndCreate': 'Rivedi e crea',
    'roleForm.review.reviewAndSave': 'Rivedi e salva',
    'roleForm.review.nameDescriptionOwner':
      'Nome, descrizione e proprietario del ruolo',
    'roleForm.review.permissionPoliciesWithCount':
      'Politiche di autorizzazione ({{count}})',
    'roleForm.steps.next': 'Successivo',
    'roleForm.steps.back': 'Indietro',
    'roleForm.steps.cancel': 'Cancella',
    'roleForm.steps.reset': 'Reset',
    'roleForm.steps.create': 'Crea',
    'roleForm.steps.save': 'Salva',
    'roleForm.fields.name.label': 'Nome',
    'roleForm.fields.name.helperText': 'Inserire il nome del ruolo',
    'roleForm.fields.description.label': 'Descrizione',
    'roleForm.fields.description.helperText':
      'Inserire una breve descrizione del ruolo (finalità del ruolo)',
    'roleForm.fields.owner.label': 'Proprietario',
    'roleForm.fields.owner.helperText':
      "Facoltativo: inserire un utente o un gruppo che avrà l'autorizzazione a modificare questo ruolo e a creare ruoli aggiuntivi. Nel passaggio successivo, specificare quali utenti possono assegnare ai loro ruoli e a quali plugin possono concedere l'accesso. Se vuoto, l'autore viene assegnato automaticamente al momento della creazione.",
    'deleteDialog.title': 'Elimina ruolo',
    'deleteDialog.question': 'Eliminare questo ruolo?',
    'deleteDialog.confirmation':
      "Eliminare il ruolo **{{roleName}}**? L'eliminazione di questo ruolo è irreversibile e ne rimuoverà la funzionalità dal sistema. Procedere con cautela. I **{{members}}** associati a questo ruolo perderanno l'accesso a tutti i **{{permissions}} criteri di autorizzazione** specificati in questo ruolo.",
    'deleteDialog.roleNameLabel': 'Nome ruolo',
    'deleteDialog.roleNameHelper': 'Digitare il nome del ruolo per confermare',
    'deleteDialog.deleteButton': 'Elimina',
    'deleteDialog.cancelButton': 'Cancella',
    'deleteDialog.successMessage': 'Ruolo {{roleName}} eliminato correttamente',
    'snackbar.success': 'Attività riuscita',
    'dialog.cancelRoleCreation': 'Annulla la creazione del ruolo',
    'dialog.exitRoleCreation': 'Abbandonare la creazione del ruolo?',
    'dialog.exitRoleEditing': 'Abbandonare la modifica del ruolo?',
    'dialog.exitWarning':
      '\n\nAbbandonando questa pagina, le informazioni immesse vengono eliminate definitivamente. Uscire?',
    'dialog.discard': 'Annulla',
    'dialog.cancel': 'Cancella',
    'conditionalAccess.condition': 'Condizione',
    'conditionalAccess.allOf': 'Tutti',
    'conditionalAccess.anyOf': 'QualunqueDi',
    'conditionalAccess.not': 'Non',
    'conditionalAccess.addNestedCondition': 'Aggiungi condizione nidificata',
    'conditionalAccess.addRule': 'Aggiungi regola',
    'conditionalAccess.nestedConditionTooltip':
      "Le condizioni nidificate sono **regole a un livello all'interno di una condizione principale**. Permette di concedere l'accesso appropriato utilizzando autorizzazioni dettagliate basate su varie condizioni. È possibile aggiungere più condizioni nidificate.",
    'conditionalAccess.nestedConditionExample':
      "Ad esempio, è possibile consentire l'accesso a tutti i tipi di entità nella condizione principale e utilizzare una condizione nidificata per limitare l'accesso alle entità di proprietà dell'utente.",
    'permissionPolicies.helperText':
      "Per impostazione predefinita, agli utenti non è concesso l'accesso ad alcun plugin. Per concedere l'accesso all'utente, selezionare i plugin da abilitare. Quindi, selezionare le azioni per cui concedere l'autorizzazione all'utente.",
    'permissionPolicies.allPlugins': 'Tutti i plugin ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      'Errore durante il recupero dei criteri di autorizzazione: {{error}}',
    'permissionPolicies.resourceTypeTooltip':
      'tipo di risorsa: {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      "Utilizza autorizzazioni personalizzate avanzate per consentire l'accesso a parti specifiche del tipo di risorsa selezionato.",
    'permissionPolicies.pluginsSelected': '{{count}} plugin',
    'permissionPolicies.noPluginsSelected': 'Nessun plugin selezionato',
    'permissionPolicies.search': 'Ricerca',
    'permissionPolicies.noRecordsToDisplay': 'Nessun record da visualizzare.',
    'permissionPolicies.selectedPluginsAppearHere':
      'I plugin selezionati vengono visualizzati qui.',
    'permissionPolicies.selectPlugins': 'Selezionare i plugin',
    'permissionPolicies.noPluginsFound': 'Nessun plugin trovato.',
    'permissionPolicies.plugin': 'Plugin',
    'permissionPolicies.permission': 'Autorizzazione',
    'permissionPolicies.policies': 'Criteri',
    'permissionPolicies.conditional': 'Condizionale',
    'permissionPolicies.rules': 'regole',
    'permissionPolicies.rule': 'regola',
    'permissionPolicies.permissionPolicies': 'Criteri di autorizzazione',
    'permissionPolicies.permissions': 'autorizzazioni',
    'common.noResults': 'Nessun risultato per questo intervallo di date.',
    'common.exportCSV': 'Esporta CSV',
    'common.csvFilename': 'data-export.csv',
    'common.noMembers': 'Nessun membro',
    'common.groups': 'gruppi',
    'common.group': 'gruppo',
    'common.users': 'utenti',
    'common.user': 'utente',
    'common.use': 'Utilizza',
    'common.refresh': 'Aggiorna',
    'common.edit': 'Modifica',
    'common.unauthorizedToEdit': 'Non autorizzato a modificare',
    'common.noRecordsFound': 'Nessun record trovato',
    'common.selectUsersAndGroups': 'Selezionare utenti e gruppi',
    'common.clearSearch': 'cancella ricerca',
    'common.closeDrawer': 'Chiudi il riquadro',
    'common.remove': 'Rimuovi',
    'common.addRule': 'Aggiungi regola',
    'common.selectRule': 'Selezionare una regola',
    'common.rule': 'Regola',
    'common.removeNestedCondition': 'Rimuovi condizione nidificata',
    'common.overview': 'Panoramica',
    'common.about': 'Informazioni',
    'common.description': 'Descrizione',
    'common.modifiedBy': 'Modificato da',
    'common.lastModified': 'Ultima modifica',
    'common.owner': 'Proprietario',
    'common.noUsersAndGroupsSelected': 'Nessun utente e gruppo selezionato',
    'common.selectedUsersAndGroupsAppearHere':
      'Qui vengono visualizzati gli utenti e i gruppi selezionati.',
    'common.name': 'Nome',
    'common.type': 'Tipo',
    'common.members': 'Membri',
    'common.actions': 'Azioni',
    'common.removeMember': 'Rimuovi membro',
    'common.delete': 'Elimina',
    'common.deleteRole': 'Elimina ruolo',
    'common.update': 'Aggiorna',
    'common.editRole': 'Modifica ruolo',
    'common.checkingPermissions': 'Controllo delle autorizzazioni in corso…',
    'common.unauthorizedTo': 'Non autorizzato a {{action}}',
    'common.performThisAction': 'eseguire questa azione',
    'common.unableToCreatePermissionPolicies':
      'Impossibile creare i criteri di autorizzazione.',
    'common.unableToDeletePermissionPolicies':
      'Impossibile eliminare i criteri di autorizzazione.',
    'common.unableToRemoveConditions':
      'Impossibile rimuovere le condizioni dal ruolo.',
    'common.unableToUpdateConditions': 'Impossibile aggiornare le condizioni.',
    'common.unableToAddConditions':
      'Impossibile aggiungere condizioni al ruolo.',
    'common.roleActionSuccessfully':
      'Ruolo {{roleName}} {{action}} eseguito correttamente',
    'common.unableToFetchRole': 'Impossibile recuperare il ruolo: {{error}}',
    'common.unableToFetchMembers': 'Impossibile recuperare i membri: {{error}}',
    'common.roleAction': 'ruolo {{azione}}',
    'common.membersCount': '{{count}} membri',
    'common.parentGroupCount': '{{count}} gruppo padre',
    'common.childGroupsCount': '{{count}} gruppi figlio',
    'common.searchAndSelectUsersGroups':
      'Per cercare e selezionare gli utenti e i gruppi da aggiungere. Gli utenti e i gruppi selezionati appariranno nella tabella sottostante.',
    'common.noUsersAndGroupsFound': 'Nessun utente e gruppo trovato.',
    'common.errorFetchingUserGroups':
      'Errore durante il recupero di utenti e gruppi: {{error}}',
    'common.nameRequired': 'Il nome è obbligatorio',
    'common.noMemberSelected': 'Nessun membro selezionato',
    'common.noPluginSelected': 'Nessun plugin selezionato',
    'common.pluginRequired': 'Il plugin è obbligatorio',
    'common.permissionRequired': "L'autorizzazione è obbligatoria",
    'common.editCell': 'Modifica...',
    'common.selectCell': 'Seleziona...',
    'common.expandRow': 'espandi riga',
    'common.configureAccessFor': "Configurare l'accesso per il",
    'common.defaultResourceTypeVisible':
      'Per impostazione predefinita, il tipo di risorsa selezionato è visibile a tutti gli utenti aggiunti. Per limitare o concedere autorizzazioni a regole specifiche del plugin, selezionarle e aggiungere i parametri.',
  },
});

export default rbacTranslationIt;
