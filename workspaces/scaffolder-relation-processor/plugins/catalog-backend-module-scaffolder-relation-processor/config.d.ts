/*
 * Copyright 2025 The Backstage Authors
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
export interface Config {
  scaffolder?: {
    /**
     * Configuration for notifications
     * @visibility frontend
     */
    notifications?: {
      /**
       * Configuration for template update notifications
       * @visibility frontend
       */
      templateUpdate?: {
        /**
         * Whether to enable template update notifications
         * @default false
         * @visibility frontend
         */
        enabled?: boolean;
        /**
         * Custom message configuration for notifications
         * @visibility frontend
         */
        message?: {
          /**
           * The notification title. Supports $ENTITY_DISPLAY_NAME template variable.
           * @default '$ENTITY_DISPLAY_NAME is out of sync with template'
           * @visibility frontend
           */
          title?: string;
          /**
           * The notification description. Supports $ENTITY_DISPLAY_NAME template variable.
           * @default 'The template used to create $ENTITY_DISPLAY_NAME has been updated to a new version. Review and update your entity to stay in sync with the template.'
           * @visibility frontend
           */
          description?: string;
        };
      };
    };
  };
}
