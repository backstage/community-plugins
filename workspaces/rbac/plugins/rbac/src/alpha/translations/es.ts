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
 * es translation for plugin.rbac.
 * @public
 */
const rbacTranslationEs = createTranslationMessages({
  ref: rbacTranslationRef,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'Crear rol',
    'page.editRole': 'Modificar rol',
    'table.searchPlaceholder': 'Filtrar',
    'table.labelRowsSelect': 'Filas',
    'table.title': 'Todos los roles',
    'table.titleWithCount': 'Todos los roles ({{count}})',
    'table.headers.name': 'Nombre',
    'table.headers.usersAndGroups': 'Usuarios y grupos',
    'table.headers.accessiblePlugins': 'Complementos accesibles',
    'table.headers.actions': 'Acciones',
    'table.defaultRoleUsersAndGroups': 'Todos los usuarios y todos los grupos',
    'table.emptyContent': 'No se encontraron registros',
    'toolbar.createButton': 'Crear',
    'toolbar.warning.title': 'No se puede crear el rol.',
    'toolbar.warning.message':
      'Para habilitar el botón crear/modificar rol, asegúrese de que los usuarios/grupos requeridos estén disponibles en el catálogo, ya que no se puede crear un rol sin usuarios/grupos, y el rol asociado con su usuario debe tener las políticas de permisos mencionadas <link>aquí</link>.',
    'toolbar.warning.linkText': 'aquí',
    'toolbar.warning.note': 'Nota',
    'toolbar.warning.noteText':
      'Incluso después de importar usuarios/grupos en el catálogo y aplicar los permisos anteriores, si el botón crear/modificar aún está deshabilitado, comuníquese con su administrador, ya que es posible que tenga restringido de forma condicional el acceso al botón crear/modificar.',
    'errors.notFound': 'No encontrado',
    'errors.notAllowed': 'Permisos insuficientes para acceder a esta página',
    'errors.unauthorized': 'No tiene autorización para crear el rol',
    'errors.rbacDisabled':
      'Habilite el complemento RBAC de back-end para utilizar esta funcionalidad.',
    'errors.rbacDisabledInfo':
      'Para habilitar RBAC, configure `permission.enabled` en `true` en el archivo app-config.',
    'errors.fetchRoles': 'Algo salió mal al extraer los roles',
    'errors.fetchRole': 'Algo salió mal al extraer el rol',
    'errors.fetchPoliciesErr': 'Error al extraer las políticas. {{error}}',
    'errors.fetchPolicies':
      'Algo salió mal al extraer las políticas de permisos',
    'errors.fetchPlugins': 'Error al extraer los complementos. {{error}}',
    'errors.fetchConditionalPermissionPolicies':
      'Error al extraer las políticas de permisos condicionales. {{error}}',
    'errors.fetchConditions':
      'Algo salió mal al extraer las condiciones del rol',
    'errors.fetchUsersAndGroups':
      'Algo salió mal al extraer los usuarios y grupos',
    'errors.createRole': 'No se puede crear el rol.',
    'errors.editRole': 'No se puede modificar el rol.',
    'errors.deleteRole': 'No se puede eliminar el rol.',
    'errors.defaultRoleReadOnly': 'El rol predeterminado es de solo lectura.',
    'errors.roleCreatedSuccess':
      'El rol se creó correctamente, pero no se pueden agregar políticas de permisos a él.',
    'errors.roleCreatedConditionsSuccess':
      'El rol se creó correctamente, pero no se pueden agregar condiciones a él.',
    'roleForm.titles.createRole': 'Crear rol',
    'roleForm.titles.editRole': 'Modificar rol',
    'roleForm.titles.nameAndDescription':
      'Ingresar el nombre, la descripción y el propietario del rol',
    'roleForm.titles.usersAndGroups': 'Agregar usuarios y grupos',
    'roleForm.titles.permissionPolicies': 'Agregar políticas de permisos',
    'roleForm.review.reviewAndCreate': 'Revisar y crear',
    'roleForm.review.reviewAndSave': 'Revisar y guardar',
    'roleForm.review.nameDescriptionOwner':
      'Nombre, descripción y propietario del rol',
    'roleForm.review.permissionPoliciesWithCount':
      'Políticas de permisos ({{count}})',
    'roleForm.steps.next': 'Siguiente',
    'roleForm.steps.back': 'Atrás',
    'roleForm.steps.cancel': 'Cancelar',
    'roleForm.steps.reset': 'Reiniciar',
    'roleForm.steps.create': 'Crear',
    'roleForm.steps.save': 'Guardar',
    'roleForm.fields.name.label': 'Nombre',
    'roleForm.fields.name.helperText': 'Ingresar el nombre del rol',
    'roleForm.fields.description.label': 'Descripción',
    'roleForm.fields.description.helperText':
      'Opcional: Ingrese una breve descripción sobre el rol (el propósito del rol)',
    'roleForm.fields.owner.label': 'Propietario',
    'roleForm.fields.owner.helperText':
      'Opcional: Ingrese un usuario o grupo que tenga permiso para modificar este rol y crear roles adicionales. En el siguiente paso, especifique a qué usuarios pueden asignar sus roles y a qué complementos pueden conceder acceso. Si se deja en blanco, se asigna automáticamente el autor en el momento de la creación.',
    'deleteDialog.title': 'Eliminar rol',
    'deleteDialog.question': '¿Eliminar este rol?',
    'deleteDialog.confirmation':
      '¿Confirma que desea eliminar el rol **{{roleName}}**? Esta acción no se puede deshacer y eliminará la funcionalidad del rol del sistema. Proceda con precaución. Los **{{members}}** asociados con este rol perderán acceso a todas las **políticas de permisos de {{permissions}}** especificadas en este rol.',
    'deleteDialog.roleNameLabel': 'Nombre del rol',
    'deleteDialog.roleNameHelper': 'Escriba el nombre del rol para confirmar',
    'deleteDialog.deleteButton': 'Eliminar',
    'deleteDialog.cancelButton': 'Cancelar',
    'deleteDialog.successMessage': 'Rol {{roleName}} eliminado correctamente',
    'snackbar.success': 'Éxito',
    'dialog.cancelRoleCreation': 'Cancelar la creación del rol',
    'dialog.exitRoleCreation': '¿Salir de la creación de roles?',
    'dialog.exitRoleEditing': '¿Salir de la modificación de roles?',
    'dialog.exitWarning':
      '\n\nAl salir de esta página, se descartará la información ingresada de forma permanente. ¿Confirma que desea salir?',
    'dialog.discard': 'Descartar',
    'dialog.cancel': 'Cancelar',
    'conditionalAccess.condition': 'Condición',
    'conditionalAccess.allOf': 'Todas',
    'conditionalAccess.anyOf': 'Cualquiera de',
    'conditionalAccess.not': 'No',
    'conditionalAccess.addNestedCondition': 'Agregar condición anidada',
    'conditionalAccess.addRule': 'Agregar regla',
    'conditionalAccess.nestedConditionTooltip':
      'Las condiciones anidadas son **reglas de una capa dentro de una condición principal**. Le permite habilitar el acceso apropiado mediante el uso de permisos detallados basados en diversas condiciones. Puede agregar varias condiciones anidadas.',
    'conditionalAccess.nestedConditionExample':
      'Por ejemplo, puede permitir el acceso a todos los tipos de entidades en la condición principal y usar una condición anidada para limitar el acceso a las entidades que son propiedad del usuario.',
    'permissionPolicies.helperText':
      'De forma predeterminada, a los usuarios no se les concede acceso a ningún complemento. Para otorgar acceso a los usuarios, seleccione los complementos que desea habilitar. Luego, seleccione las acciones a las que desea otorgarle permiso al usuario.',
    'permissionPolicies.allPlugins': 'Todos los complementos ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      'Error al extraer las políticas de permisos: {{error}}',
    'permissionPolicies.resourceTypeTooltip':
      'tipo de recurso: {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      'Utilice permisos personalizados avanzados para permitir el acceso a partes específicas del tipo de recurso seleccionado.',
    'permissionPolicies.noAdvancedPermissionsTooltip':
      'No se admite la personalización avanzada para este tipo de recurso.',
    'permissionPolicies.pluginsSelected': '{{count}} complementos',
    'permissionPolicies.noPluginsSelected': 'No hay complementos seleccionados',
    'permissionPolicies.search': 'Buscar',
    'permissionPolicies.noRecordsToDisplay': 'No hay registros para mostrar.',
    'permissionPolicies.selectedPluginsAppearHere':
      'Los complementos seleccionados aparecen aquí.',
    'permissionPolicies.selectPlugins': 'Seleccionar complementos',
    'permissionPolicies.noPluginsFound': 'No se encontraron complementos.',
    'permissionPolicies.plugin': 'Complemento',
    'permissionPolicies.permission': 'Permiso',
    'permissionPolicies.policies': 'Políticas',
    'permissionPolicies.conditional': 'Condicional',
    'permissionPolicies.rules': 'reglas',
    'permissionPolicies.rule': 'regla',
    'permissionPolicies.permissionPolicies': 'Políticas de permisos',
    'permissionPolicies.permissions': 'permisos',
    'common.noResults': 'No hay resultados para este rango de fechas.',
    'common.exportCSV': 'Exportar CSV',
    'common.csvFilename': 'data-export.csv',
    'common.noMembers': 'No hay miembros',
    'common.groups': 'grupos',
    'common.group': 'grupo',
    'common.users': 'usuarios',
    'common.user': 'usuario',
    'common.use': 'Usar',
    'common.refresh': 'Actualizar',
    'common.edit': 'Modificar',
    'common.unauthorizedToEdit': 'No tiene autorización para modificar',
    'common.noRecordsFound': 'No se encontraron registros',
    'common.selectUsersAndGroups': 'Seleccionar usuarios y grupos',
    'common.clearSearch': 'borrar búsqueda',
    'common.closeDrawer': 'Cerrar el panel',
    'common.remove': 'Eliminar',
    'common.addRule': 'Agregar regla',
    'common.selectRule': 'Seleccionar una regla',
    'common.rule': 'Regla',
    'common.removeNestedCondition': 'Eliminar condición anidada',
    'common.overview': 'Visión general',
    'common.about': 'Acerca de',
    'common.description': 'Descripción',
    'common.modifiedBy': 'Modificado por',
    'common.lastModified': 'Última modificación',
    'common.owner': 'Propietario',
    'common.noUsersAndGroupsSelected':
      'No hay usuarios ni grupos seleccionados',
    'common.selectedUsersAndGroupsAppearHere':
      'Aquí aparecen los usuarios y grupos seleccionados.',
    'common.name': 'Nombre',
    'common.type': 'Tipo',
    'common.members': 'Miembros',
    'common.actions': 'Acciones',
    'common.removeMember': 'Eliminar miembro',
    'common.delete': 'Eliminar',
    'common.deleteRole': 'Eliminar rol',
    'common.update': 'Actualizar',
    'common.editRole': 'Modificar rol',
    'common.checkingPermissions': 'Comprobando permisos…',
    'common.unauthorizedTo': 'No tiene autorización para {{acción}}',
    'common.performThisAction': 'realizar esta acción',
    'common.unableToCreatePermissionPolicies':
      'No se pueden crear las políticas de permisos.',
    'common.unableToDeletePermissionPolicies':
      'No se pueden eliminar las políticas de permisos.',
    'common.unableToRemoveConditions':
      'No se pueden eliminar las condiciones del rol.',
    'common.unableToUpdateConditions':
      'No se pueden actualizar las condiciones.',
    'common.unableToAddConditions': 'No se pueden agregar condiciones al rol.',
    'common.roleActionSuccessfully':
      'El rol {{roleName}} {{action}} correctamente',
    'common.unableToFetchRole': 'No se puede extraer el rol: {{error}}',
    'common.unableToFetchMembers':
      'No se pueden extraer los miembros: {{error}}',
    'common.roleAction': '{{action}} rol',
    'common.membersCount': '{{count}} miembros',
    'common.parentGroupCount': '{{count}} grupo principal',
    'common.childGroupsCount': '{{count}} grupos secundarios',
    'common.searchAndSelectUsersGroups':
      'Busque y seleccione los usuarios y grupos que desea agregar. Los usuarios y grupos seleccionados aparecerán en la tabla a continuación.',
    'common.noUsersAndGroupsFound': 'No se encontraron usuarios ni grupos.',
    'common.errorFetchingUserGroups':
      'Error al extraer usuarios y grupos: {{error}}',
    'common.nameRequired': 'El nombre es obligatorio',
    'common.noMemberSelected': 'No se seleccionaron miembros',
    'common.noPluginSelected': 'No hay complementos seleccionados',
    'common.pluginRequired': 'Se requiere complemento',
    'common.permissionRequired': 'Se requiere permiso',
    'common.editCell': 'Modificar...',
    'common.selectCell': 'Seleccionar...',
    'common.expandRow': 'expandir fila',
    'common.configureAccessFor': 'Configurar acceso para',
    'common.defaultResourceTypeVisible':
      'De forma predeterminada, todos los usuarios agregados pueden visualizar el tipo de recurso seleccionado. Si desea restringir u otorgar permiso a reglas de complementos específicas, selecciónelas y agregue los parámetros.',
  },
});

export default rbacTranslationEs;
