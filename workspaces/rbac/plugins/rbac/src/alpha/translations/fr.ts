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
 * fr translation for plugin.rbac.
 * @public
 */
const rbacTranslationFr = createTranslationMessages({
  ref: rbacTranslationRef,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'Créer un rôle',
    'page.editRole': 'Modifier le rôle',
    'table.searchPlaceholder': 'Filtre',
    'table.labelRowsSelect': 'Lignes',
    'table.title': 'Tous les rôles',
    'table.titleWithCount': 'Tous les rôles ({{count}})',
    'table.headers.name': 'Nom',
    'table.headers.usersAndGroups': 'Utilisateurs et groupes',
    'table.headers.accessiblePlugins': 'Plugins accessibles',
    'table.headers.actions': 'Actes',
    'table.emptyContent': 'Aucun enregistrement trouvé',
    'toolbar.createButton': 'Créer',
    'toolbar.warning.title': 'Impossible de créer le rôle.',
    'toolbar.warning.message':
      "Pour activer le bouton Créer/Modifier un rôle, assurez-vous que les utilisateurs/groupes requis sont disponibles dans le catalogue, car un rôle ne peut pas être créé sans utilisateurs/groupes et que le rôle associé à votre utilisateur doit également avoir les politiques d'autorisation mentionnées. <link>ici</link>.",
    'toolbar.warning.linkText': 'ici',
    'toolbar.warning.note': 'Note',
    'toolbar.warning.noteText':
      "Même après avoir ingéré des utilisateurs/groupes dans le catalogue et appliqué les autorisations ci-dessus, si le bouton Créer/Modifier est toujours désactivé, veuillez contacter votre administrateur car vous pourriez être conditionnellement limité dans l'accès au bouton Créer/Modifier.",
    'errors.notFound': 'Non trouvé',
    'errors.notAllowed': 'Permissions insuffisantes pour accéder à cette page',
    'errors.unauthorized': 'Non autorisé à créer un rôle',
    'errors.rbacDisabled':
      'Activez le plugin backend RBAC pour utiliser cette fonctionnalité.',
    'errors.rbacDisabledInfo':
      'Pour activer RBAC, définissez « permission.enabled » sur « true » dans le fichier app-config.',
    'errors.fetchRoles':
      "Une erreur s'est produite lors de la récupération des rôles",
    'errors.fetchRole':
      "Une erreur s'est produite lors de la récupération du rôle",
    'errors.fetchPoliciesErr':
      'Erreur lors de la récupération des politiques. {{error}}',
    'errors.fetchPolicies':
      "Une erreur s'est produite lors de la récupération des politiques d'autorisation.",
    'errors.fetchPlugins':
      'Erreur lors de la récupération des plugins. {{error}}',
    'errors.fetchConditionalPermissionPolicies':
      "Erreur lors de la récupération des politiques d'autorisation conditionnelle. {{error}}",
    'errors.fetchConditions':
      "Une erreur s'est produite lors de la récupération des conditions de rôle",
    'errors.fetchUsersAndGroups':
      "Une erreur s'est produite lors de la récupération des utilisateurs et des groupes",
    'errors.createRole': 'Impossible de créer le rôle.',
    'errors.editRole': 'Impossible de modifier le rôle.',
    'errors.deleteRole': 'Impossible de supprimer le rôle.',
    'errors.roleCreatedSuccess':
      "Le rôle a été créé avec succès, mais il n'a pas été possible d'ajouter des stratégies d'autorisation au rôle.",
    'errors.roleCreatedConditionsSuccess':
      "Rôle créé avec succès mais impossible d'ajouter des conditions au rôle.",
    'roleForm.titles.createRole': 'Créer un rôle',
    'roleForm.titles.editRole': 'Modifier le rôle',
    'roleForm.titles.nameAndDescription':
      'Entrez le nom et la description du rôle',
    'roleForm.titles.usersAndGroups': 'Ajouter des utilisateurs et des groupes',
    'roleForm.titles.permissionPolicies':
      "Ajouter des politiques d'autorisation",
    'roleForm.review.reviewAndCreate': 'Réviser et créer',
    'roleForm.review.reviewAndSave': 'Révisez et enregistrez',
    'roleForm.review.nameDescriptionOwner':
      'Nom, description et propriétaire du rôle',
    'roleForm.review.permissionPoliciesWithCount':
      "Politiques d'autorisations ({{count}})",
    'roleForm.steps.next': 'Suivant',
    'roleForm.steps.back': 'Retour',
    'roleForm.steps.cancel': 'Annuler',
    'roleForm.steps.reset': 'Réinitialiser',
    'roleForm.steps.create': 'Créer',
    'roleForm.steps.save': 'Sauvegarder',
    'roleForm.fields.name.label': 'Nom',
    'roleForm.fields.name.helperText': 'Entrez le nom du rôle',
    'roleForm.fields.description.label': 'Description',
    'roleForm.fields.description.helperText':
      'Saisissez une brève description du rôle (le but du rôle)',
    'roleForm.fields.owner.label': 'Propriétaire',
    'roleForm.fields.owner.helperText':
      "Facultatif : saisissez un utilisateur ou un groupe qui sera autorisé à modifier ce rôle et à créer des rôles supplémentaires. À l’étape suivante, spécifiez les utilisateurs auxquels ils peuvent attribuer leurs rôles et les plugins auxquels ils peuvent accorder l’accès. Si laissé vide, attribue automatiquement l'auteur lors de la création.",
    'deleteDialog.title': 'Supprimer le rôle',
    'deleteDialog.question': 'Supprimer ce rôle ?',
    'deleteDialog.confirmation':
      "Êtes-vous sûr de vouloir supprimer le rôle **{{roleName}}** ? La suppression de ce rôle est irréversible et supprimera sa fonctionnalité du système. Procédez avec prudence. Les **{{members}}** associés à ce rôle perdront l'accès à toutes les **{{permissions}} politiques d'autorisation** spécifiées dans ce rôle.",
    'deleteDialog.roleNameLabel': 'Nom du rôle',
    'deleteDialog.roleNameHelper': 'Tapez le nom du rôle pour confirmer',
    'deleteDialog.deleteButton': 'Supprimer',
    'deleteDialog.cancelButton': 'Annuler',
    'deleteDialog.successMessage':
      'Le rôle {{roleName}} a été supprimé avec succès',
    'snackbar.success': 'Succès',
    'dialog.cancelRoleCreation': 'Annuler la création du rôle',
    'dialog.exitRoleCreation': "Création d'un rôle de sortie ?",
    'dialog.exitRoleEditing': "Quitter l'édition du rôle ?",
    'dialog.exitWarning':
      '\n\nQuitter cette page supprimera définitivement les informations que vous avez saisies. Etes-vous sûr de vouloir quitter ?',
    'dialog.discard': 'Ignorer',
    'dialog.cancel': 'Annuler',
    'conditionalAccess.condition': 'Condition',
    'conditionalAccess.allOf': 'AllOf',
    'conditionalAccess.anyOf': 'AnyOf',
    'conditionalAccess.not': 'Aucun',
    'conditionalAccess.addNestedCondition': 'Ajouter une condition imbriquée',
    'conditionalAccess.addRule': 'Ajouter une règle',
    'conditionalAccess.nestedConditionTooltip':
      "Les conditions imbriquées sont des **règles à 1 couche dans une condition principale**. Il vous permet d'autoriser un accès approprié en utilisant des autorisations détaillées basées sur diverses conditions. Vous pouvez ajouter plusieurs conditions imbriquées.",
    'conditionalAccess.nestedConditionExample':
      'Par exemple, vous pouvez autoriser l’accès à tous les types d’entités dans la condition principale et utiliser une condition imbriquée pour limiter l’accès aux entités appartenant à l’utilisateur.',
    'permissionPolicies.helperText':
      "Par défaut, les utilisateurs n'ont accès à aucun plugin. Pour accorder l’accès utilisateur, sélectionnez les plugins que vous souhaitez activer. Ensuite, sélectionnez les actions pour lesquelles vous souhaitez accorder l’autorisation à l’utilisateur.",
    'permissionPolicies.allPlugins': 'Tous les plugins ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      "Erreur lors de la récupération des politiques d'autorisation : {{error}}",
    'permissionPolicies.resourceTypeTooltip':
      'type de ressource : {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      'Utilisez des autorisations personnalisées avancées pour autoriser l’accès à des parties spécifiques du type de ressource sélectionné.',
    'permissionPolicies.pluginsSelected': '{{count}} plugins',
    'permissionPolicies.noPluginsSelected': 'Aucun plugin sélectionné',
    'permissionPolicies.search': 'Recherche',
    'permissionPolicies.noRecordsToDisplay': 'Aucun enregistrement à afficher',
    'permissionPolicies.selectedPluginsAppearHere':
      'Les plugins sélectionnés apparaissent ici.',
    'permissionPolicies.selectPlugins': 'Sélectionner les plugins',
    'permissionPolicies.noPluginsFound': 'Aucun plugin trouvé',
    'permissionPolicies.plugin': 'Plugin',
    'permissionPolicies.permission': 'Autorisation',
    'permissionPolicies.policies': 'Politiques',
    'permissionPolicies.conditional': 'Conditionnel',
    'permissionPolicies.rules': 'règles',
    'permissionPolicies.rule': 'règle',
    'permissionPolicies.permissionPolicies': "Politiques d'autorisation",
    'permissionPolicies.permissions': 'autorisations',
    'common.noResults': 'Aucun résultat pour cette plage de dates.',
    'common.exportCSV': 'Exporter au format CSV',
    'common.csvFilename': 'export-de-données.csv',
    'common.noMembers': 'Aucun membre',
    'common.groups': 'groupes',
    'common.group': 'groupe',
    'common.users': 'utilisateurs',
    'common.user': 'utilisateur',
    'common.use': 'Utiliser',
    'common.refresh': 'Rafraîchir',
    'common.edit': 'Modifier',
    'common.unauthorizedToEdit': 'Modification non autorisée',
    'common.noRecordsFound': 'Aucun enregistrement trouvé',
    'common.selectUsersAndGroups':
      'Sélectionner les utilisateurs et les groupes',
    'common.clearSearch': 'supprimer la recherche',
    'common.closeDrawer': 'Fermez le tiroir',
    'common.remove': 'Supprimer',
    'common.addRule': 'Ajouter une règle',
    'common.selectRule': 'Sélectionnez une règle',
    'common.rule': 'Règle',
    'common.removeNestedCondition': 'Supprimer la condition imbriquée',
    'common.overview': 'Vue d’ensemble',
    'common.about': 'À propos',
    'common.description': 'Description',
    'common.modifiedBy': 'Modifié par',
    'common.lastModified': 'Dernière modification',
    'common.owner': 'Propriétaire',
    'common.noUsersAndGroupsSelected':
      'Aucun utilisateur ni groupe sélectionné',
    'common.selectedUsersAndGroupsAppearHere':
      'Les utilisateurs et groupes sélectionnés apparaissent ici.',
    'common.name': 'Nom',
    'common.type': 'Type',
    'common.members': 'Membres',
    'common.actions': 'Actes',
    'common.removeMember': 'Supprimer le membre',
    'common.delete': 'Supprimer',
    'common.deleteRole': 'Supprimer le rôle',
    'common.update': 'Mise à jour',
    'common.editRole': 'Modifier le rôle',
    'common.checkingPermissions': 'Vérification des autorisations…',
    'common.unauthorizedTo': 'Non autorisé à {{action}}',
    'common.performThisAction': 'effectuer cette action',
    'common.unableToCreatePermissionPolicies':
      "Impossible de créer les politiques d'autorisation.",
    'common.unableToDeletePermissionPolicies':
      "Impossible de supprimer les politiques d'autorisation.",
    'common.unableToRemoveConditions':
      'Impossible de supprimer les conditions du rôle.',
    'common.unableToUpdateConditions':
      'Impossible de mettre à jour les conditions.',
    'common.unableToAddConditions':
      "Impossible d'ajouter des conditions au rôle.",
    'common.roleActionSuccessfully': 'Rôle {{roleName}} {{action}} avec succès',
    'common.unableToFetchRole': 'Impossible de récupérer le rôle : {{error}}',
    'common.unableToFetchMembers':
      'Impossible de récupérer les membres : {{error}}',
    'common.roleAction': 'rôle {{action}}',
    'common.membersCount': '{{count}} membres',
    'common.parentGroupCount': '{{count}} groupe parent',
    'common.childGroupsCount': '{{count}} groupes enfants',
    'common.searchAndSelectUsersGroups':
      'Recherchez et sélectionnez les utilisateurs et les groupes à ajouter. Les utilisateurs et groupes sélectionnés apparaîtront dans le tableau ci-dessous.',
    'common.noUsersAndGroupsFound': 'Aucun utilisateur ni groupe trouvé.',
    'common.errorFetchingUserGroups':
      "Erreur lors de la récupération de l'utilisateur et des groupes : {{error}}",
    'common.nameRequired': 'Le nom est obligatoire',
    'common.noMemberSelected': 'Aucun membre sélectionné',
    'common.noPluginSelected': 'Aucun plugin sélectionné',
    'common.pluginRequired': 'Le plugin est requis',
    'common.permissionRequired': 'Une autorisation est requise',
    'common.editCell': 'Modifier...',
    'common.selectCell': 'Sélectionner...',
    'common.expandRow': 'développer la ligne',
    'common.configureAccessFor': "Configurer l'accès pour le",
    'common.defaultResourceTypeVisible':
      'Par défaut, le type de ressource sélectionné est visible par tous les utilisateurs ajoutés. Si vous souhaitez restreindre ou accorder une autorisation à des règles de plugin spécifiques, sélectionnez-les et ajoutez les paramètres.',
  },
});

export default rbacTranslationFr;
