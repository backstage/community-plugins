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

export { manageApiExtension } from './apis';

export type {
  ManageConditionOptions,
  ManageCondition,
  ManageConfig,
  ManageCardLoader,
  ManageCardRef,
  ManageCardLoaderResult,
} from './data-refs';
export { manageConfigDataRef, manageCardRef } from './data-refs';

export type {
  ManageCardWidgetParams,
  ManageContentWidgetAccordion,
  ManageContentWidgetAccordionTitle,
  ManageTabFullHeight,
} from './blueprints';
export {
  ManageConfigBlueprint,
  ManageHeaderLabelBlueprint,
  ManageEntityColumnBlueprint,
  ManageProviderBlueprint,
  ManageSettingsBlueprint,
  ManageTabBlueprint,
  ManageEntityContentWidgetBlueprint,
  ManageEntityCardWidgetBlueprint,
} from './blueprints';

export type { CardWidgetOptions } from './types';
