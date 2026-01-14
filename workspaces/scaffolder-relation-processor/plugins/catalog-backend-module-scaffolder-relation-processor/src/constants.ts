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

/**
 * Topic for template version update events
 *
 * @public
 */
export const TEMPLATE_VERSION_UPDATED_TOPIC =
  'relationProcessor.template:version_updated';

/**
 * Template variable name for entity name in notification messages
 *
 * @public
 */
export const ENTITY_DISPLAY_NAME_TEMPLATE_VAR = '$ENTITY_DISPLAY_NAME';

/**
 * Default template update notification title
 *
 * @public
 */
export const DEFAULT_NOTIFICATION_TITLE = `${ENTITY_DISPLAY_NAME_TEMPLATE_VAR} is out of sync with template`;

/**
 * Default template update notification description
 *
 * @public
 */
export const DEFAULT_NOTIFICATION_DESCRIPTION = `The template used to create ${ENTITY_DISPLAY_NAME_TEMPLATE_VAR} has been updated to a new version. Review and update your entity to stay in sync with the template.`;

/**
 * Default notification enabled
 *
 * @public
 */
export const DEFAULT_NOTIFICATION_ENABLED = false;

/**
 * Default pull request creation enabled
 *
 * @public
 */
export const DEFAULT_PR_ENABLED = false;

/**
 * Template variable name for PR link in notification messages
 *
 * @public
 */
export const PR_LINK_TEMPLATE_VAR = '$PR_LINK';

/**
 * Default template update notification title when PR is created
 *
 * @public
 */
export const DEFAULT_NOTIFICATION_TITLE_WITH_PR = `${ENTITY_DISPLAY_NAME_TEMPLATE_VAR} has a template update PR ready`;

/**
 * Default template update notification description when PR is created
 *
 * @public
 */
export const DEFAULT_NOTIFICATION_DESCRIPTION_WITH_PR = `The template used to create ${ENTITY_DISPLAY_NAME_TEMPLATE_VAR} has been updated to a new version. A pull request has been created to sync the changes: ${PR_LINK_TEMPLATE_VAR}`;

/**
 * Prefix for notification description when PR creation fails
 *
 * @public
 */
export const PR_CREATION_FAILED_PREFIX = 'Failed to create template update PR';

/**
 * Documentation URL for the Template Update PRs feature
 *
 * @public
 */
export const TEMPLATE_UPDATE_PRS_DOCS_URL =
  'https://github.com/backstage/community-plugins/tree/main/workspaces/scaffolder-relation-processor/plugins/catalog-backend-module-scaffolder-relation-processor/docs/templateUpdatePRs.md';

/**
 * A relation from a scaffolder template entity to the entity it generated.
 * Reverse direction of {@link RELATION_SCAFFOLDED_FROM}
 *
 * @public
 */
export const RELATION_SCAFFOLDER_OF = 'scaffolderOf';

/**
 * A relation of an entity generated from a scaffolder template entity
 * Reverse direction of {@link RELATION_SCAFFOLDER_OF}
 *
 * @public
 */
export const RELATION_SCAFFOLDED_FROM = 'scaffoldedFrom';
