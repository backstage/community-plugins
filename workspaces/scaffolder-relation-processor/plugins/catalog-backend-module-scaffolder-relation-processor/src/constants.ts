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
