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
 * Annotation key for Apiiro repository ID.
 * Used to link Backstage entities to Apiiro repositories.
 * @public
 */
export const APIIRO_PROJECT_ANNOTATION = 'apiiro.com/repo-id';

/**
 * Annotation key for Apiiro application ID.
 * Used to link Backstage system entities to Apiiro applications.
 * @public
 */
export const APIIRO_APPLICATION_ANNOTATION = 'apiiro.com/application-id';

/**
 * Annotation key for controlling Apiiro metrics visibility.
 * Set to 'true' or 'false' to enable/disable metrics view for an entity.
 * @public
 */
export const APIIRO_METRICS_VIEW_ANNOTATION = 'apiiro.com/allow-metrics-view';

/**
 * Default base URL for the Apiiro API.
 * @public
 */
export const APIIRO_DEFAULT_BASE_URL = 'https://app.apiiro.com';
