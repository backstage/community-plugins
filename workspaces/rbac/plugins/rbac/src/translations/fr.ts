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

const rbacTranslationFr = createTranslationMessages({
  ref: rbacTranslationRef,
  full: true,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'Créer un rôle',
    'page.editRole': 'Modifier le rôle',
    'table.searchPlaceholder': 'Filtrer',
    'table.title': 'Tous les rôles',
    'table.titleWithCount': 'Tous les rôles ({{count}})',
    'table.headers.name': 'Nom',
    'table.headers.usersAndGroups': 'Utilisateurs et groupes',
    'table.headers.accessiblePlugins': 'Plugins accessibles',
    'table.headers.actions': 'Actions',
    'table.emptyContent': 'Aucun enregistrement trouvé',
    'table.labelRowsSelect': 'Rangées',
    'toolbar.createButton': 'Créer',
    'toolbar.warning.title': 'Impossible de créer un rôle.',
    'toolbar.warning.message':
      'Pour activer le bouton créer/modifier le rôle, assurez-vous que les utilisateurs/groupes requis sont disponibles dans le catalogue car un rôle ne peut pas être créé sans utilisateurs/groupes et que le rôle associé à votre utilisateur doit avoir les politiques de permissions mentionnées <link>ici</link>.',
    'toolbar.warning.linkText': 'ici',
    'toolbar.warning.note': 'Note',
    'toolbar.warning.noteText':
      "Même après avoir ingéré les utilisateurs/groupes dans le catalogue et appliqué les permissions ci-dessus, si le bouton créer/modifier est toujours désactivé, veuillez contacter votre administrateur car vous pourriez être conditionnellement restreint d'accéder au bouton créer/modifier.",
    'errors.notFound': 'Non trouvé',
    'errors.unauthorized': 'Non autorisé à créer un rôle',
    'errors.rbacDisabled':
      'Activez le plugin backend RBAC pour utiliser cette fonctionnalité.',
    'errors.rbacDisabledInfo':
      "Pour activer RBAC, définissez `permission.enabled` sur `true` dans le fichier de configuration de l'application.",
    'errors.fetchRoles':
      "Quelque chose s'est mal passé lors de la récupération des rôles",
    'errors.fetchRole':
      "Quelque chose s'est mal passé lors de la récupération du rôle",
    'errors.fetchPolicies':
      "Quelque chose s'est mal passé lors de la récupération des politiques de permission",
    'errors.fetchPoliciesErr':
      'Erreur lors de la récupération des politiques. {{error}}',
    'errors.fetchPlugins':
      'Erreur lors de la récupération des plugins. {{error}}',
    'errors.fetchConditionalPermissionPolicies':
      'Erreur lors de la récupération des politiques de permissions conditionnelles. {{error}}',
    'errors.fetchConditions':
      "Quelque chose s'est mal passé lors de la récupération des conditions de rôle",
    'errors.fetchUsersAndGroups':
      "Quelque chose s'est mal passé lors de la récupération des utilisateurs et groupes",
    'errors.createRole': 'Impossible de créer le rôle.',
    'errors.editRole': 'Impossible de modifier le rôle.',
    'errors.deleteRole': 'Impossible de supprimer le rôle.',
    'errors.roleCreatedSuccess':
      "Le rôle a été créé avec succès mais impossible d'ajouter les politiques de permission au rôle.",
    'errors.roleCreatedConditionsSuccess':
      "Le rôle a été créé avec succès mais impossible d'ajouter des conditions au rôle.",
    'roleForm.titles.createRole': 'Créer un rôle',
    'roleForm.titles.editRole': 'Modifier le rôle',
    'roleForm.titles.nameAndDescription':
      'Entrez le nom et la description du rôle',
    'roleForm.titles.usersAndGroups': 'Ajouter des utilisateurs et des groupes',
    'roleForm.titles.permissionPolicies':
      'Ajouter des politiques de permission',
    'roleForm.review.reviewAndCreate': 'Examiner et créer',
    'roleForm.review.reviewAndSave': 'Examiner et sauvegarder',
    'roleForm.review.nameDescriptionOwner':
      'Nom, description et propriétaire du rôle',
    'roleForm.steps.next': 'Suivant',
    'roleForm.steps.back': 'Retour',
    'roleForm.steps.cancel': 'Annuler',
    'roleForm.steps.reset': 'Réinitialiser',
    'roleForm.steps.create': 'Créer',
    'roleForm.steps.save': 'Enregistrer',
    'roleForm.fields.name.label': 'Nom',
    'roleForm.fields.name.helperText': 'Entrez le nom du rôle',
    'roleForm.fields.description.label': 'Description',
    'roleForm.fields.description.helperText':
      'Entrez une brève description du rôle (Le but du rôle)',
    'roleForm.fields.owner.label': 'Propriétaire',
    'roleForm.fields.owner.helperText':
      "Optionnel : Entrez un utilisateur ou un groupe qui aura la permission de modifier ce rôle et de créer des rôles supplémentaires. À l'étape suivante, spécifiez quels utilisateurs ils peuvent assigner à leurs rôles et quels plugins ils peuvent accorder l'accès. Si laissé vide, assigne automatiquement l'auteur lors de la création.",
    'deleteDialog.title': 'Supprimer le rôle',
    'deleteDialog.question': 'Supprimer ce rôle ?',
    'deleteDialog.confirmation':
      "Êtes-vous sûr de vouloir supprimer le rôle **{{roleName}}**?\n\nSupprimer ce rôle est irréversible et supprimera sa fonctionnalité du système. Procédez avec prudence.\n\nLes **{{members}}** associés à ce rôle perdront l'accès à toutes les **{{permissions}} politiques de permission** spécifiées dans ce rôle.",
    'deleteDialog.roleNameLabel': 'Nom du rôle',
    'deleteDialog.roleNameHelper': 'Tapez le nom du rôle pour confirmer',
    'deleteDialog.deleteButton': 'Supprimer',
    'deleteDialog.cancelButton': 'Annuler',
    'deleteDialog.successMessage': 'Rôle {{roleName}} supprimé avec succès',
    'snackbar.success': 'Succès',
    'common.noResults': 'Aucun résultat pour cette plage de dates.',
    'common.exportCSV': 'Exporter CSV',
    'common.csvFilename': 'export-donnees.csv',
    'common.noMembers': 'Aucun membre',
    'common.groups': 'groupes',
    'common.group': 'groupe',
    'common.users': 'utilisateurs',
    'common.user': 'utilisateur',
    'common.use': 'Utiliser',
    'common.refresh': 'Actualiser',
    'common.edit': 'Modifier',
    'common.unauthorizedToEdit': 'Non autorisé à modifier',
    'common.noRecordsFound': 'Aucun enregistrement trouvé',
    'common.selectUsersAndGroups': 'Sélectionner les utilisateurs et groupes',
    'common.clearSearch': 'effacer la recherche',
    'common.closeDrawer': 'Fermer le tiroir',
    'common.remove': 'Supprimer',
    'common.addRule': 'Ajouter une règle',
    'common.selectRule': 'Sélectionner une règle',
    'common.rule': 'Règle',
    'common.removeNestedCondition': 'Supprimer la condition imbriquée',
    'common.overview': 'Aperçu',
    'common.about': 'À propos',
    'common.description': 'Description',
    'common.modifiedBy': 'Modifié par',
    'common.lastModified': 'Dernière modification',
    'common.owner': 'Propriétaire',
    'common.noUsersAndGroupsSelected':
      'Aucun utilisateur et groupe sélectionné',
    'common.selectedUsersAndGroupsAppearHere':
      'Les utilisateurs et groupes sélectionnés apparaissent ici.',
    'common.name': 'Nom',
    'common.type': 'Type',
    'common.members': 'Membres',
    'common.actions': 'Actions',
    'common.removeMember': 'Supprimer le membre',
    'common.delete': 'Supprimer',
    'common.deleteRole': 'Supprimer le rôle',
    'common.update': 'Mettre à jour',
    'common.editRole': 'Modifier le rôle',
    'common.checkingPermissions': 'Vérification des permissions…',
    'common.unauthorizedTo': 'Non autorisé pour {{action}}',
    'common.performThisAction': 'effectuer cette action',
    'common.unableToCreatePermissionPolicies':
      'Impossible de créer les politiques de permissions.',
    'common.unableToDeletePermissionPolicies':
      'Impossible de supprimer les politiques de permissions.',
    'common.unableToRemoveConditions':
      'Impossible de supprimer les conditions du rôle.',
    'common.unableToUpdateConditions':
      'Impossible de mettre à jour les conditions.',
    'common.unableToAddConditions':
      "Impossible d'ajouter des conditions au rôle.",
    'common.roleActionSuccessfully': 'Rôle {{roleName}} {{action}} avec succès',
    'common.unableToFetchRole': 'Impossible de récupérer le rôle : {{error}}',
    'common.unableToFetchMembers':
      'Impossible de récupérer les membres : {{error}}',
    'common.roleAction': '{{action}} rôle',
    'common.membersCount': '{{count}} membres',
    'common.parentGroupCount': '{{count}} groupe parent',
    'common.childGroupsCount': '{{count}} groupes enfants',
    'common.searchAndSelectUsersGroups':
      'Recherchez et sélectionnez les utilisateurs et groupes à ajouter. Les utilisateurs et groupes sélectionnés apparaîtront dans le tableau ci-dessous.',
    'common.noUsersAndGroupsFound': 'Aucun utilisateur et groupe trouvé.',
    'common.errorFetchingUserGroups':
      'Erreur lors de la récupération des utilisateurs et groupes : {{error}}',
    'common.nameRequired': 'Le nom est requis',
    'common.noMemberSelected': 'Aucun membre sélectionné',
    'common.noPluginSelected': 'Aucun plugin sélectionné',
    'common.pluginRequired': 'Le plugin est requis',
    'common.permissionRequired': 'La permission est requise',
    'common.editCell': 'Modifier...',
    'common.selectCell': 'Sélectionner...',
    'common.expandRow': 'développer la ligne',
    'common.configureAccessFor': "Configurer l'accès pour",
    'common.defaultResourceTypeVisible':
      'Par défaut, le type de ressource sélectionné est visible pour tous les utilisateurs ajoutés. Si vous souhaitez restreindre ou accorder des permissions à des règles de plugin spécifiques, sélectionnez-les et ajoutez les paramètres.',
    'conditionalAccess.condition': 'Condition',
    'conditionalAccess.allOf': 'AllOf',
    'conditionalAccess.anyOf': 'AnyOf',
    'conditionalAccess.not': 'Not',
    'conditionalAccess.addNestedCondition': 'Ajouter une condition imbriquée',
    'conditionalAccess.addRule': 'Ajouter une règle',
    'conditionalAccess.nestedConditionTooltip':
      "Les conditions imbriquées sont des **règles de 1 couche au sein d'une condition principale**. Elles vous permettent de permettre un accès approprié en utilisant des permissions détaillées basées sur diverses conditions. Vous pouvez ajouter plusieurs conditions imbriquées.",
    'conditionalAccess.nestedConditionExample':
      "Par exemple, vous pouvez autoriser l'accès à tous les types d'entités dans la condition principale et utiliser une condition imbriquée pour limiter l'accès aux entités appartenant à l'utilisateur.",
    'dialog.cancelRoleCreation': 'Annuler la création de rôle',
    'dialog.exitRoleCreation': 'Quitter la création de rôle ?',
    'dialog.exitRoleEditing': 'Quitter la modification de rôle ?',
    'dialog.exitWarning':
      '\n\nQuitter cette page supprimera définitivement les informations que vous avez saisies.\n\nÊtes-vous sûr de vouloir quitter ?',
    'dialog.discard': 'Ignorer',
    'dialog.cancel': 'Annuler',
    'permissionPolicies.helperText':
      "Par défaut, les utilisateurs n'ont pas accès aux plugins. Pour accorder l'accès aux utilisateurs, sélectionnez les plugins que vous souhaitez activer. Ensuite, sélectionnez les actions que vous souhaitez autoriser pour l'utilisateur.",
    'permissionPolicies.allPlugins': 'Tous les plugins ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      'Erreur lors de la récupération des politiques de permissions : {{error}}',
    'permissionPolicies.resourceTypeTooltip':
      'type de ressource : {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      "Utilisez des permissions personnalisées avancées pour autoriser l'accès à des parties spécifiques du type de ressource sélectionné.",
    'permissionPolicies.pluginsSelected': '{{count}} plugins',
    'permissionPolicies.noPluginsSelected': 'Aucun plugin sélectionné',
    'permissionPolicies.search': 'Rechercher',
    'permissionPolicies.noRecordsToDisplay': 'Aucun enregistrement à afficher.',
    'permissionPolicies.selectedPluginsAppearHere':
      'Les plugins sélectionnés apparaissent ici.',
    'permissionPolicies.selectPlugins': 'Sélectionner les plugins',
    'permissionPolicies.noPluginsFound': 'Aucun plugin trouvé.',
    'permissionPolicies.plugin': 'Plugin',
    'permissionPolicies.permission': 'Permission',
    'permissionPolicies.policies': 'Politiques',
    'permissionPolicies.conditional': 'Conditionnel',
    'permissionPolicies.rules': 'règles',
    'permissionPolicies.rule': 'règle',
    'permissionPolicies.permissionPolicies': 'Politiques de permissions',
    'permissionPolicies.permissions': 'permissions',
  },
});

export default rbacTranslationFr;
