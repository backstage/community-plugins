/*
 * Copyright 2026 The Backstage Authors
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
 * Describes a backend request whose JSON response is exposed to the template.
 *
 * @public
 */
export type DataFetcher = {
  /** Property name the response is exposed under in the template props. */
  name: string;
  /** Backend plugin ID resolved through the discovery API, e.g. `catalog`. */
  pluginId: string;
  /**
   * Path relative to the plugin base URL. Supports Nunjucks expressions with
   * `entity` and `user` in scope, e.g. `/entities/by-name/{{ entity.kind }}/...`.
   */
  apiUrl: string;
};

/**
 * Fields of an MDX card template that can be written by clients.
 *
 * @public
 */
export type MdxCardTemplateInput = {
  title?: string;
  template: string;
  dataFetchers: DataFetcher[];
};

/**
 * MDX card template stored by the MDX card backend.
 *
 * @public
 */
export type MdxCardTemplate = MdxCardTemplateInput & {
  /** Identifier used to reference the template from cards. */
  id: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

/**
 * Stored template without its content, as returned when listing templates.
 *
 * @public
 */
export type MdxCardTemplateSummary = Omit<
  MdxCardTemplate,
  'template' | 'dataFetchers'
>;

/**
 * Pattern that template identifiers must match.
 *
 * @public
 */
export const MDX_CARD_TEMPLATE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
