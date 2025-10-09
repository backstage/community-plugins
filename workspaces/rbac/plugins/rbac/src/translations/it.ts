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

const rbacTranslationIt = createTranslationMessages({
  ref: rbacTranslationRef,
  full: true,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'Crea ruolo',
    'page.editRole': 'Modifica ruolo',
    'table.searchPlaceholder': 'Filtra',
    'table.title': 'Tutti i ruoli',
    'table.titleWithCount': 'Tutti i ruoli ({{count}})',
    'table.headers.name': 'Nome',
    'table.headers.usersAndGroups': 'Utenti e gruppi',
    'table.headers.accessiblePlugins': 'Plugin accessibili',
    'table.headers.actions': 'Azioni',
    'table.emptyContent': 'Nessun record trovato',
    'table.labelRowsSelect': 'Righe',
    'toolbar.createButton': 'Crea',
    'toolbar.warning.title': 'Impossibile creare il ruolo.',
    'toolbar.warning.message':
      'Per abilitare il pulsante crea/modifica ruolo, assicurati che gli utenti/gruppi richiesti siano disponibili nel catalogo poiché un ruolo non può essere creato senza utenti/gruppi e anche il ruolo associato al tuo utente dovrebbe avere le politiche di permesso menzionate <link>qui</link>.',
    'toolbar.warning.linkText': 'qui',
    'toolbar.warning.note': 'Nota',
    'toolbar.warning.noteText':
      "Anche dopo aver ingerito utenti/gruppi nel catalogo e applicato i permessi sopra menzionati, se il pulsante crea/modifica è ancora disabilitato, contatta il tuo amministratore poiché potresti essere condizionalmente limitato dall'accesso al pulsante crea/modifica.",
    'errors.notFound': 'Non trovato',
    'errors.unauthorized': 'Non autorizzato a creare un ruolo',
    'errors.rbacDisabled':
      'Abilita il plugin backend RBAC per utilizzare questa funzionalità.',
    'errors.rbacDisabledInfo':
      "Per abilitare RBAC, imposta `permission.enabled` su `true` nel file di configurazione dell'app.",
    'errors.fetchRoles':
      'Qualcosa è andato storto durante il recupero dei ruoli',
    'errors.fetchRole':
      'Qualcosa è andato storto durante il recupero del ruolo',
    'errors.fetchPolicies':
      'Qualcosa è andato storto durante il recupero delle politiche di permesso',
    'errors.fetchPoliciesErr': 'Errore nel recupero delle politiche. {{error}}',
    'errors.fetchPlugins': 'Errore nel recupero dei plugin. {{error}}',
    'errors.fetchConditionalPermissionPolicies':
      'Errore nel recupero delle politiche di permessi condizionali. {{error}}',
    'errors.fetchConditions':
      'Qualcosa è andato storto durante il recupero delle condizioni del ruolo',
    'errors.fetchUsersAndGroups':
      'Qualcosa è andato storto durante il recupero di utenti e gruppi',
    'errors.createRole': 'Impossibile creare il ruolo.',
    'errors.editRole': 'Impossibile modificare il ruolo.',
    'errors.deleteRole': 'Impossibile eliminare il ruolo.',
    'errors.roleCreatedSuccess':
      'Il ruolo è stato creato con successo ma impossibile aggiungere le politiche di permesso al ruolo.',
    'errors.roleCreatedConditionsSuccess':
      'Il ruolo è stato creato con successo ma impossibile aggiungere condizioni al ruolo.',
    'roleForm.titles.createRole': 'Crea ruolo',
    'roleForm.titles.editRole': 'Modifica ruolo',
    'roleForm.titles.nameAndDescription':
      'Inserisci nome e descrizione del ruolo',
    'roleForm.titles.usersAndGroups': 'Aggiungi utenti e gruppi',
    'roleForm.titles.permissionPolicies': 'Aggiungi politiche di permesso',
    'roleForm.review.reviewAndCreate': 'Rivedi e crea',
    'roleForm.review.reviewAndSave': 'Rivedi e salva',
    'roleForm.review.nameDescriptionOwner':
      'Nome, descrizione e proprietario del ruolo',
    'roleForm.steps.next': 'Avanti',
    'roleForm.steps.back': 'Indietro',
    'roleForm.steps.cancel': 'Annulla',
    'roleForm.steps.reset': 'Reimposta',
    'roleForm.steps.create': 'Crea',
    'roleForm.steps.save': 'Salva',
    'roleForm.fields.name.label': 'Nome',
    'roleForm.fields.name.helperText': 'Inserisci il nome del ruolo',
    'roleForm.fields.description.label': 'Descrizione',
    'roleForm.fields.description.helperText':
      'Inserisci una breve descrizione del ruolo (Lo scopo del ruolo)',
    'roleForm.fields.owner.label': 'Proprietario',
    'roleForm.fields.owner.helperText':
      "Opzionale: Inserisci un utente o gruppo che avrà il permesso di modificare questo ruolo e creare ruoli aggiuntivi. Nel prossimo passo, specifica quali utenti possono assegnare ai loro ruoli e a quali plugin possono concedere accesso. Se lasciato vuoto, assegna automaticamente l'autore alla creazione.",
    'deleteDialog.title': 'Elimina ruolo',
    'deleteDialog.question': 'Eliminare questo ruolo?',
    'deleteDialog.confirmation':
      "Sei sicuro di voler eliminare il ruolo **{{roleName}}**?\n\nEliminare questo ruolo è irreversibile e rimuoverà la sua funzionalità dal sistema. Procedi con cautela.\n\nGli **{{members}}** associati a questo ruolo perderanno l'accesso a tutte le **{{permissions}} politiche di permesso** specificate in questo ruolo.",
    'deleteDialog.roleNameLabel': 'Nome del ruolo',
    'deleteDialog.roleNameHelper': 'Digita il nome del ruolo per confermare',
    'deleteDialog.deleteButton': 'Elimina',
    'deleteDialog.cancelButton': 'Annulla',
    'deleteDialog.successMessage': 'Ruolo {{roleName}} eliminato con successo',
    'snackbar.success': 'Successo',
    'common.noResults': 'Nessun risultato per questo intervallo di date.',
    'common.exportCSV': 'Esporta CSV',
    'common.csvFilename': 'esportazione-dati.csv',
    'common.noMembers': 'Nessun membro',
    'common.groups': 'gruppi',
    'common.group': 'gruppo',
    'common.users': 'utenti',
    'common.user': 'utente',
    'common.use': 'Usa',
    'common.refresh': 'Aggiorna',
    'common.edit': 'Modifica',
    'common.unauthorizedToEdit': 'Non autorizzato a modificare',
    'common.noRecordsFound': 'Nessun record trovato',
    'common.selectUsersAndGroups': 'Seleziona utenti e gruppi',
    'common.clearSearch': 'cancella ricerca',
    'common.closeDrawer': 'Chiudi il cassetto',
    'common.remove': 'Rimuovi',
    'common.addRule': 'Aggiungi regola',
    'common.selectRule': 'Seleziona una regola',
    'common.rule': 'Regola',
    'common.removeNestedCondition': 'Rimuovi condizione annidata',
    'common.overview': 'Panoramica',
    'common.about': 'Informazioni',
    'common.description': 'Descrizione',
    'common.modifiedBy': 'Modificato da',
    'common.lastModified': 'Ultima modifica',
    'common.owner': 'Proprietario',
    'common.noUsersAndGroupsSelected': 'Nessun utente e gruppo selezionato',
    'common.selectedUsersAndGroupsAppearHere':
      'Gli utenti e gruppi selezionati appaiono qui.',
    'common.name': 'Nome',
    'common.type': 'Tipo',
    'common.members': 'Membri',
    'common.actions': 'Azioni',
    'common.removeMember': 'Rimuovi membro',
    'common.delete': 'Elimina',
    'common.deleteRole': 'Elimina ruolo',
    'common.update': 'Aggiorna',
    'common.editRole': 'Modifica ruolo',
    'common.checkingPermissions': 'Controllo dei permessi…',
    'common.unauthorizedTo': 'Non autorizzato per {{action}}',
    'common.performThisAction': 'eseguire questa azione',
    'common.unableToCreatePermissionPolicies':
      'Impossibile creare le politiche di permessi.',
    'common.unableToDeletePermissionPolicies':
      'Impossibile eliminare le politiche di permessi.',
    'common.unableToRemoveConditions':
      'Impossibile rimuovere le condizioni dal ruolo.',
    'common.unableToUpdateConditions': 'Impossibile aggiornare le condizioni.',
    'common.unableToAddConditions':
      'Impossibile aggiungere condizioni al ruolo.',
    'common.roleActionSuccessfully':
      'Ruolo {{roleName}} {{action}} con successo',
    'common.unableToFetchRole': 'Impossibile recuperare il ruolo: {{error}}',
    'common.unableToFetchMembers': 'Impossibile recuperare i membri: {{error}}',
    'common.roleAction': '{{action}} ruolo',
    'common.membersCount': '{{count}} membri',
    'common.parentGroupCount': '{{count}} gruppo padre',
    'common.childGroupsCount': '{{count}} gruppi figli',
    'common.searchAndSelectUsersGroups':
      'Cerca e seleziona utenti e gruppi da aggiungere. Gli utenti e gruppi selezionati appariranno nella tabella sottostante.',
    'common.noUsersAndGroupsFound': 'Nessun utente e gruppo trovato.',
    'common.errorFetchingUserGroups':
      'Errore nel recupero di utenti e gruppi: {{error}}',
    'common.nameRequired': 'Il nome è richiesto',
    'common.noMemberSelected': 'Nessun membro selezionato',
    'common.noPluginSelected': 'Nessun plugin selezionato',
    'common.pluginRequired': 'Il plugin è richiesto',
    'common.permissionRequired': 'Il permesso è richiesto',
    'common.editCell': 'Modifica...',
    'common.selectCell': 'Seleziona...',
    'common.expandRow': 'espandi riga',
    'common.configureAccessFor': 'Configura accesso per',
    'common.defaultResourceTypeVisible':
      'Per impostazione predefinita, il tipo di risorsa selezionato è visibile a tutti gli utenti aggiunti. Se vuoi limitare o concedere permessi a regole di plugin specifiche, selezionale e aggiungi i parametri.',
    'conditionalAccess.condition': 'Condizione',
    'conditionalAccess.allOf': 'AllOf',
    'conditionalAccess.anyOf': 'AnyOf',
    'conditionalAccess.not': 'Not',
    'conditionalAccess.addNestedCondition': 'Aggiungi condizione annidata',
    'conditionalAccess.addRule': 'Aggiungi regola',
    'conditionalAccess.nestedConditionTooltip':
      "Le condizioni annidate sono **regole di 1 livello all'interno di una condizione principale**. Ti permettono di consentire un accesso appropriato utilizzando permessi dettagliati basati su varie condizioni. Puoi aggiungere più condizioni annidate.",
    'conditionalAccess.nestedConditionExample':
      "Ad esempio, puoi consentire l'accesso a tutti i tipi di entità nella condizione principale e utilizzare una condizione annidata per limitare l'accesso alle entità di proprietà dell'utente.",
    'dialog.cancelRoleCreation': 'Annulla creazione ruolo',
    'dialog.exitRoleCreation': 'Uscire dalla creazione del ruolo?',
    'dialog.exitRoleEditing': 'Uscire dalla modifica del ruolo?',
    'dialog.exitWarning':
      '\n\nUscire da questa pagina scarterà permanentemente le informazioni inserite.\n\nSei sicuro di voler uscire?',
    'dialog.discard': 'Scarta',
    'dialog.cancel': 'Annulla',
    'permissionPolicies.helperText':
      "Per impostazione predefinita, agli utenti non viene concesso l'accesso a nessun plugin. Per concedere l'accesso agli utenti, seleziona i plugin che vuoi abilitare. Quindi, seleziona le azioni che vuoi autorizzare per l'utente.",
    'permissionPolicies.allPlugins': 'Tutti i plugin ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      'Errore nel recupero delle politiche di permessi: {{error}}',
    'permissionPolicies.resourceTypeTooltip':
      'tipo di risorsa: {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      "Usa permessi personalizzati avanzati per consentire l'accesso a parti specifiche del tipo di risorsa selezionato.",
    'permissionPolicies.pluginsSelected': '{{count}} plugin',
    'permissionPolicies.noPluginsSelected': 'Nessun plugin selezionato',
    'permissionPolicies.search': 'Cerca',
    'permissionPolicies.noRecordsToDisplay': 'Nessun record da visualizzare.',
    'permissionPolicies.selectedPluginsAppearHere':
      'I plugin selezionati appaiono qui.',
    'permissionPolicies.selectPlugins': 'Seleziona plugin',
    'permissionPolicies.noPluginsFound': 'Nessun plugin trovato.',
    'permissionPolicies.plugin': 'Plugin',
    'permissionPolicies.permission': 'Permesso',
    'permissionPolicies.policies': 'Politiche',
    'permissionPolicies.conditional': 'Condizionale',
    'permissionPolicies.rules': 'regole',
    'permissionPolicies.rule': 'regola',
    'permissionPolicies.permissionPolicies': 'Politiche di permessi',
    'permissionPolicies.permissions': 'permessi',
  },
});

export default rbacTranslationIt;
