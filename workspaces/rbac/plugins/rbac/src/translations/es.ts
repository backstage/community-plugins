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

const rbacTranslationEs = createTranslationMessages({
  ref: rbacTranslationRef,
  full: true,
  messages: {
    'page.title': 'RBAC',
    'page.createRole': 'Crear rol',
    'page.editRole': 'Editar rol',
    'table.searchPlaceholder': 'Filtrar',
    'table.title': 'Todos los roles',
    'table.titleWithCount': 'Todos los roles ({{count}})',
    'table.headers.name': 'Nombre',
    'table.headers.usersAndGroups': 'Usuarios y grupos',
    'table.headers.accessiblePlugins': 'Plugins accesibles',
    'table.headers.actions': 'Acciones',
    'table.emptyContent': 'No se encontraron registros',
    'table.labelRowsSelect': 'Filas',
    'toolbar.createButton': 'Crear',
    'toolbar.warning.title': 'No se puede crear el rol.',
    'toolbar.warning.message':
      'Para habilitar el botón crear/editar rol, asegúrate de que los usuarios/grupos requeridos estén disponibles en el catálogo, ya que no se puede crear un rol sin usuarios/grupos y también el rol asociado con tu usuario debe tener las políticas de permisos mencionadas <link>aquí</link>.',
    'toolbar.warning.linkText': 'aquí',
    'toolbar.warning.note': 'Nota',
    'toolbar.warning.noteText':
      'Incluso después de ingerir usuarios/grupos en el catálogo y aplicar los permisos mencionados anteriormente, si el botón crear/editar sigue deshabilitado, por favor contacta a tu administrador ya que podrías estar condicionalmente restringido de acceder al botón crear/editar.',
    'errors.notFound': 'No encontrado',
    'errors.unauthorized': 'No autorizado para crear un rol',
    'errors.rbacDisabled':
      'Habilita el plugin backend RBAC para usar esta funcionalidad.',
    'errors.rbacDisabledInfo':
      'Para habilitar RBAC, establece `permission.enabled` en `true` en el archivo de configuración de la aplicación.',
    'errors.fetchRoles': 'Algo salió mal al obtener los roles',
    'errors.fetchRole': 'Algo salió mal al obtener el rol',
    'errors.fetchPolicies':
      'Algo salió mal al obtener las políticas de permisos',
    'errors.fetchPoliciesErr': 'Error al obtener las políticas. {{error}}',
    'errors.fetchPlugins': 'Error al obtener los plugins. {{error}}',
    'errors.fetchConditionalPermissionPolicies':
      'Error al obtener las políticas de permisos condicionales. {{error}}',
    'errors.fetchConditions':
      'Algo salió mal al obtener las condiciones del rol',
    'errors.fetchUsersAndGroups': 'Algo salió mal al obtener usuarios y grupos',
    'errors.createRole': 'No se puede crear el rol.',
    'errors.editRole': 'No se puede editar el rol.',
    'errors.deleteRole': 'No se puede eliminar el rol.',
    'errors.roleCreatedSuccess':
      'El rol fue creado exitosamente pero no se pudieron agregar las políticas de permisos al rol.',
    'errors.roleCreatedConditionsSuccess':
      'El rol fue creado exitosamente pero no se pudieron agregar condiciones al rol.',
    'roleForm.titles.createRole': 'Crear rol',
    'roleForm.titles.editRole': 'Editar rol',
    'roleForm.titles.nameAndDescription':
      'Ingresa nombre y descripción del rol',
    'roleForm.titles.usersAndGroups': 'Agregar usuarios y grupos',
    'roleForm.titles.permissionPolicies': 'Agregar políticas de permisos',
    'roleForm.review.reviewAndCreate': 'Revisar y crear',
    'roleForm.review.reviewAndSave': 'Revisar y guardar',
    'roleForm.review.nameDescriptionOwner':
      'Nombre, descripción y propietario del rol',
    'roleForm.steps.next': 'Siguiente',
    'roleForm.steps.back': 'Atrás',
    'roleForm.steps.cancel': 'Cancelar',
    'roleForm.steps.reset': 'Reiniciar',
    'roleForm.steps.create': 'Crear',
    'roleForm.steps.save': 'Guardar',
    'roleForm.fields.name.label': 'Nombre',
    'roleForm.fields.name.helperText': 'Ingresa el nombre del rol',
    'roleForm.fields.description.label': 'Descripción',
    'roleForm.fields.description.helperText':
      'Ingresa una breve descripción del rol (El propósito del rol)',
    'roleForm.fields.owner.label': 'Propietario',
    'roleForm.fields.owner.helperText':
      'Opcional: Ingresa un usuario o grupo que tendrá permiso para editar este rol y crear roles adicionales. En el siguiente paso, especifica qué usuarios pueden asignar a sus roles y a qué plugins pueden otorgar acceso. Si se deja en blanco, asigna automáticamente el autor en la creación.',
    'deleteDialog.title': 'Eliminar rol',
    'deleteDialog.question': '¿Eliminar este rol?',
    'deleteDialog.confirmation':
      '¿Estás seguro de que quieres eliminar el rol **{{roleName}}**?\n\nEliminar este rol es irreversible y eliminará su funcionalidad del sistema. Procede con precaución.\n\nLos **{{members}}** asociados con este rol perderán el acceso a todas las **{{permissions}} políticas de permisos** especificadas en este rol.',
    'deleteDialog.roleNameLabel': 'Nombre del rol',
    'deleteDialog.roleNameHelper': 'Escribe el nombre del rol para confirmar',
    'deleteDialog.deleteButton': 'Eliminar',
    'deleteDialog.cancelButton': 'Cancelar',
    'deleteDialog.successMessage': 'Rol {{roleName}} eliminado exitosamente',
    'snackbar.success': 'Éxito',
    'common.noResults': 'No hay resultados para este rango de fechas.',
    'common.exportCSV': 'Exportar CSV',
    'common.csvFilename': 'exportacion-datos.csv',
    'common.noMembers': 'Sin miembros',
    'common.groups': 'grupos',
    'common.group': 'grupo',
    'common.users': 'usuarios',
    'common.user': 'usuario',
    'common.use': 'Usar',
    'common.refresh': 'Actualizar',
    'common.edit': 'Editar',
    'common.unauthorizedToEdit': 'No autorizado para editar',
    'common.noRecordsFound': 'No se encontraron registros',
    'common.selectUsersAndGroups': 'Seleccionar usuarios y grupos',
    'common.clearSearch': 'limpiar búsqueda',
    'common.closeDrawer': 'Cerrar el cajón',
    'common.remove': 'Eliminar',
    'common.addRule': 'Agregar regla',
    'common.selectRule': 'Seleccionar una regla',
    'common.rule': 'Regla',
    'common.removeNestedCondition': 'Eliminar condición anidada',
    'common.overview': 'Resumen',
    'common.about': 'Acerca de',
    'common.description': 'Descripción',
    'common.modifiedBy': 'Modificado por',
    'common.lastModified': 'Última modificación',
    'common.owner': 'Propietario',
    'common.noUsersAndGroupsSelected': 'No se seleccionaron usuarios y grupos',
    'common.selectedUsersAndGroupsAppearHere':
      'Los usuarios y grupos seleccionados aparecen aquí.',
    'common.name': 'Nombre',
    'common.type': 'Tipo',
    'common.members': 'Miembros',
    'common.actions': 'Acciones',
    'common.removeMember': 'Eliminar miembro',
    'common.delete': 'Eliminar',
    'common.deleteRole': 'Eliminar rol',
    'common.update': 'Actualizar',
    'common.editRole': 'Editar rol',
    'common.checkingPermissions': 'Verificando permisos…',
    'common.unauthorizedTo': 'No autorizado para {{action}}',
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
    'common.roleActionSuccessfully': 'Rol {{roleName}} {{action}} exitosamente',
    'common.unableToFetchRole': 'No se puede obtener el rol: {{error}}',
    'common.unableToFetchMembers':
      'No se pueden obtener los miembros: {{error}}',
    'common.roleAction': '{{action}} rol',
    'common.membersCount': '{{count}} miembros',
    'common.parentGroupCount': '{{count}} grupo padre',
    'common.childGroupsCount': '{{count}} grupos hijos',
    'common.searchAndSelectUsersGroups':
      'Busque y seleccione usuarios y grupos para agregar. Los usuarios y grupos seleccionados aparecerán en la tabla a continuación.',
    'common.noUsersAndGroupsFound': 'No se encontraron usuarios y grupos.',
    'common.errorFetchingUserGroups':
      'Error al obtener usuarios y grupos: {{error}}',
    'common.nameRequired': 'El nombre es requerido',
    'common.noMemberSelected': 'Ningún miembro seleccionado',
    'common.noPluginSelected': 'Ningún plugin seleccionado',
    'common.pluginRequired': 'El plugin es requerido',
    'common.permissionRequired': 'El permiso es requerido',
    'common.editCell': 'Editar...',
    'common.selectCell': 'Seleccionar...',
    'common.expandRow': 'expandir fila',
    'common.configureAccessFor': 'Configurar acceso para',
    'common.defaultResourceTypeVisible':
      'Por defecto, el tipo de recurso seleccionado es visible para todos los usuarios agregados. Si quieres restringir o otorgar permisos a reglas de plugin específicas, selecciónalas y agrega los parámetros.',
    'conditionalAccess.condition': 'Condición',
    'conditionalAccess.allOf': 'AllOf',
    'conditionalAccess.anyOf': 'AnyOf',
    'conditionalAccess.not': 'Not',
    'conditionalAccess.addNestedCondition': 'Agregar condición anidada',
    'conditionalAccess.addRule': 'Agregar regla',
    'conditionalAccess.nestedConditionTooltip':
      'Las condiciones anidadas son **reglas de 1 nivel dentro de una condición principal**. Te permiten permitir un acceso apropiado utilizando permisos detallados basados en varias condiciones. Puedes agregar múltiples condiciones anidadas.',
    'conditionalAccess.nestedConditionExample':
      'Por ejemplo, puedes permitir el acceso a todos los tipos de entidades en la condición principal y usar una condición anidada para limitar el acceso a las entidades propiedad del usuario.',
    'dialog.cancelRoleCreation': 'Cancelar creación de rol',
    'dialog.exitRoleCreation': '¿Salir de la creación de rol?',
    'dialog.exitRoleEditing': '¿Salir de la edición de rol?',
    'dialog.exitWarning':
      '\n\nSalir de esta página descartará permanentemente la información que ingresaste.\n\n¿Estás seguro de que quieres salir?',
    'dialog.discard': 'Descartar',
    'dialog.cancel': 'Cancelar',
    'permissionPolicies.helperText':
      'Por defecto, a los usuarios no se les otorga acceso a ningún plugin. Para otorgar acceso a los usuarios, selecciona los plugins que quieres habilitar. Luego, selecciona qué acciones te gustaría dar permiso al usuario.',
    'permissionPolicies.allPlugins': 'Todos los plugins ({{count}})',
    'permissionPolicies.errorFetchingPolicies':
      'Error al obtener las políticas de permisos: {{error}}',
    'permissionPolicies.resourceTypeTooltip':
      'tipo de recurso: {{resourceType}}',
    'permissionPolicies.advancedPermissionsTooltip':
      'Usa permisos personalizados avanzados para permitir el acceso a partes específicas del tipo de recurso seleccionado.',
    'permissionPolicies.pluginsSelected': '{{count}} plugins',
    'permissionPolicies.noPluginsSelected': 'Ningún plugin seleccionado',
    'permissionPolicies.search': 'Buscar',
    'permissionPolicies.noRecordsToDisplay': 'No hay registros para mostrar.',
    'permissionPolicies.selectedPluginsAppearHere':
      'Los plugins seleccionados aparecen aquí.',
    'permissionPolicies.selectPlugins': 'Seleccionar plugins',
    'permissionPolicies.noPluginsFound': 'No se encontraron plugins.',
    'permissionPolicies.plugin': 'Plugin',
    'permissionPolicies.permission': 'Permiso',
    'permissionPolicies.policies': 'Políticas',
    'permissionPolicies.conditional': 'Condicional',
    'permissionPolicies.rules': 'reglas',
    'permissionPolicies.rule': 'regla',
    'permissionPolicies.permissionPolicies': 'Políticas de permisos',
    'permissionPolicies.permissions': 'permisos',
  },
});

export default rbacTranslationEs;
