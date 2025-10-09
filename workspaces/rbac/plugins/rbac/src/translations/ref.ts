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
import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

export const rbacMessages = {
  page: {
    title: 'RBAC',
    createRole: 'Create role',
    editRole: 'Edit role',
  },
  table: {
    searchPlaceholder: 'Filter',
    labelRowsSelect: 'Rows',
    title: 'All roles',
    titleWithCount: 'All roles ({{count}})',
    headers: {
      name: 'Name',
      usersAndGroups: 'Users and groups',
      accessiblePlugins: 'Accessible plugins',
      actions: 'Actions',
    },
    emptyContent: 'No records found',
  },
  toolbar: {
    createButton: 'Create',
    warning: {
      title: 'Unable to create role.',
      message:
        'To enable create/edit role button, make sure required users/groups are available in catalog as a role cannot be created without users/groups and also the role associated with your user should have the permission policies mentioned <link>here</link>.',
      linkText: 'here',
      note: 'Note',
      noteText:
        'Even after ingesting users/groups in catalog and applying above permissions if the create/edit button is still disabled then please contact your administrator as you might be conditionally restricted from accessing the create/edit button.',
    },
  },
  errors: {
    notFound: 'Not Found',
    unauthorized: 'Unauthorized to create role',
    rbacDisabled: 'Enable the RBAC backend plugin to use this feature.',
    rbacDisabledInfo:
      'To enable RBAC, set `permission.enabled` to `true` in the app-config file.',
    fetchRoles: 'Something went wrong while fetching the roles',
    fetchRole: 'Something went wrong while fetching the role',
    fetchPoliciesErr: 'Error fetching the policies. {{error}}',
    fetchPolicies:
      'Something went wrong while fetching the permission policies',
    fetchPlugins: 'Error fetching the plugins. {{error}}',
    fetchConditionalPermissionPolicies:
      'Error fetching the conditional permission policies. {{error}}',
    fetchConditions: 'Something went wrong while fetching the role conditions',
    fetchUsersAndGroups:
      'Something went wrong while fetching the users and groups',
    createRole: 'Unable to create role.',
    editRole: 'Unable to edit the role.',
    deleteRole: 'Unable to delete the role.',
    roleCreatedSuccess:
      'Role was created successfully but unable to add permission policies to the role.',
    roleCreatedConditionsSuccess:
      'Role created successfully but unable to add conditions to the role.',
  },
  roleForm: {
    titles: {
      createRole: 'Create Role',
      editRole: 'Edit Role',
      nameAndDescription: 'Enter name and description of role',
      usersAndGroups: 'Add users and groups',
      permissionPolicies: 'Add permission policies',
    },
    review: {
      reviewAndCreate: 'Review and create',
      reviewAndSave: 'Review and save',
      nameDescriptionOwner: 'Name, description, and owner of role',
    },
    steps: {
      next: 'Next',
      back: 'Back',
      cancel: 'Cancel',
      reset: 'Reset',
      create: 'Create',
      save: 'Save',
    },
    fields: {
      name: {
        label: 'Name',
        helperText: 'Enter name of the role',
      },
      description: {
        label: 'Description',
        helperText:
          'Enter a brief description about the role (The purpose of the role)',
      },
      owner: {
        label: 'Owner',
        helperText:
          'Optional: Enter a user or group who will have permission to edit this role and create additional roles. In the next step, specify which users they can assign to their roles and which plugins they can grant access to. If left blank, automatically assigns the author at creation.',
      },
    },
  },
  deleteDialog: {
    title: 'Delete Role',
    question: 'Delete this role?',
    confirmation:
      'Are you sure you want to delete the role **{{roleName}}**?\n\nDeleting this role is irreversible and will remove its functionality from the system. Proceed with caution.\n\nThe **{{members}}** associated with this role will lose access to all the **{{permissions}} permission policies** specified in this role.',
    roleNameLabel: 'Role name',
    roleNameHelper: 'Type the name of the role to confirm',
    deleteButton: 'Delete',
    cancelButton: 'Cancel',
    successMessage: 'Role {{roleName}} deleted successfully',
  },
  snackbar: {
    success: 'Success',
  },
  dialog: {
    cancelRoleCreation: 'Cancel role creation',
    exitRoleCreation: 'Exit role creation?',
    exitRoleEditing: 'Exit role editing?',
    exitWarning:
      '\n\nExiting this page will permanently discard the information you entered.\n\nAre you sure you want to exit?',
    discard: 'Discard',
    cancel: 'Cancel',
  },
  conditionalAccess: {
    condition: 'Condition',
    allOf: 'AllOf',
    anyOf: 'AnyOf',
    not: 'Not',
    addNestedCondition: 'Add nested condition',
    addRule: 'Add rule',
    nestedConditionTooltip:
      'Nested conditions are **1 layer rules within a main condition**. It lets you allow appropriate access by using detailed permissions based on various conditions. You can add multiple nested conditions.',
    nestedConditionExample:
      'For example, you can allow access to all entity types in the main condition and use a nested condition to limit the access to entities owned by the user.',
  },
  permissionPolicies: {
    helperText:
      'By default, users are not granted access to any plugins. To grant user access, select the plugins you want to enable. Then, select which actions you would like to give user permission to.',
    allPlugins: 'All plugins ({{count}})',
    errorFetchingPolicies: 'Error fetching the permission policies: {{error}}',
    resourceTypeTooltip: 'resource type: {{resourceType}}',
    advancedPermissionsTooltip:
      'Use advanced customized permissions to allow access to specific parts of the selected resource type.',
    pluginsSelected: '{{count}} plugins',
    noPluginsSelected: 'No plugins selected',
    search: 'Search',
    noRecordsToDisplay: 'No records to display.',
    selectedPluginsAppearHere: 'Selected plugins appear here.',
    selectPlugins: 'Select plugins',
    noPluginsFound: 'No plugins found.',
    plugin: 'Plugin',
    permission: 'Permission',
    policies: 'Policies',
    conditional: 'Conditional',
    rules: 'rules',
    rule: 'rule',
    permissionPolicies: 'Permission Policies',
    permissions: 'permissions',
  },
  common: {
    noResults: 'No results for this date range.',
    exportCSV: 'Export CSV',
    csvFilename: 'data-export.csv',
    noMembers: 'No members',
    groups: 'groups',
    group: 'group',
    users: 'users',
    user: 'user',
    use: 'Use',
    refresh: 'Refresh',
    edit: 'Edit',
    unauthorizedToEdit: 'Unauthorized to edit',
    noRecordsFound: 'No records found',
    selectUsersAndGroups: 'Select users and groups',
    clearSearch: 'clear search',
    closeDrawer: 'Close the drawer',
    remove: 'Remove',
    addRule: 'Add rule',
    selectRule: 'Select a rule',
    rule: 'Rule',
    removeNestedCondition: 'Remove nested condition',
    overview: 'Overview',
    about: 'About',
    description: 'Description',
    modifiedBy: 'Modified By',
    lastModified: 'Last Modified',
    owner: 'Owner',
    noUsersAndGroupsSelected: 'No users and groups selected',
    selectedUsersAndGroupsAppearHere: 'Selected users and groups appear here.',
    name: 'Name',
    type: 'Type',
    members: 'Members',
    actions: 'Actions',
    removeMember: 'Remove member',
    delete: 'Delete',
    deleteRole: 'Delete Role',
    update: 'Update',
    editRole: 'Edit Role',
    checkingPermissions: 'Checking permissions…',
    unauthorizedTo: 'Unauthorized to {{action}}',
    performThisAction: 'perform this action',
    unableToCreatePermissionPolicies:
      'Unable to create the permission policies.',
    unableToDeletePermissionPolicies:
      'Unable to delete the permission policies.',
    unableToRemoveConditions: 'Unable to remove conditions from the role.',
    unableToUpdateConditions: 'Unable to update conditions.',
    unableToAddConditions: 'Unable to add conditions to the role.',
    roleActionSuccessfully: 'Role {{roleName}} {{action}} successfully',
    unableToFetchRole: 'Unable to fetch role: {{error}}',
    unableToFetchMembers: 'Unable to fetch members: {{error}}',
    roleAction: '{{action}} role',
    membersCount: '{{count}} members',
    parentGroupCount: '{{count}} parent group',
    childGroupsCount: '{{count}} child groups',
    searchAndSelectUsersGroups:
      'Search and select users and groups to be added. Selected users and groups will appear in the table below.',
    noUsersAndGroupsFound: 'No users and groups found.',
    errorFetchingUserGroups: 'Error fetching user and groups: {{error}}',
    nameRequired: 'Name is required',
    noMemberSelected: 'No member selected',
    noPluginSelected: 'No plugin selected',
    pluginRequired: 'Plugin is required',
    permissionRequired: 'Permission is required',
    editCell: 'Edit...',
    selectCell: 'Select...',
    expandRow: 'expand row',
    configureAccessFor: 'Configure access for the',
    defaultResourceTypeVisible:
      'By default, the selected resource type is visible to all added users. If you want to restrict or grant permission to specific plugin rules, select them and add the parameters.',
  },
};

/**
 * Translation reference for RBAC plugin
 * @public
 */
export const rbacTranslationRef = createTranslationRef({
  id: 'plugin.rbac',
  messages: rbacMessages,
});
