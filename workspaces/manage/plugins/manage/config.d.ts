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
  /**
   * Manage page configuration (for the new frontend system)
   *
   * @deepVisibility frontend
   */
  manage?: {
    /**
     * The kinds of entities to include
     */
    kinds: string[];

    /**
     * The title of the page
     */
    title?: string;

    /**
     * The subtitle of the page
     */
    subtitle?: string;

    /**
     * The theme ID to use for the page
     */
    themeId?: string;

    /**
     * The default value for "Combine" mode.
     */
    combined: boolean;

    /**
     * Whether to show the "Combine" button in the header
     *
     * @defaultValue true
     */
    showCombined: boolean;

    /**
     * Enable (show) the "Starred entities" tab by default.
     *
     * @defaultValue true
     */
    enableStarredEntities?: boolean;

    /**
     * Show the Organization chart tab
     */
    showOrganizationChart?: boolean;

    /**
     * Enable the "Whole organization" filter.
     * NOTE: This is not feasible for large organizations.
     */
    enableWholeOrganization?: boolean;

    /**
     * Order handling. This includes the order of entity kind tabs, other tabs,
     * card widgets, content widgets and columns.
     *
     * Unless specified otherwise, the values are Node IDs, such as
     *   - `manage-content-widget:<module>/<my-widget-id>`
     *   - `manage-column:<module>/<my-column-id>`
     *
     * The prefixes `manage-content-widget:`, `manage-column:` etc can be omitted.
     */
    order?: {
      /**
       * The order in which kinds should be displayed. The values are lower case
       * kind names.
       */
      kinds?: string[];

      /**
       * The order of tabs to show in the UI.
       *
       * The values are the paths of the tabs excluding the leading '/'.
       */
      tabs?: string[];

      /** Order of card widgets */
      cards?: string[];

      /** Order of content widgets shown _above_ the entities list */
      contentAbove?: string[];

      /** Order of content widgets shown _below_ the entities list */
      contentBelow?: string[];

      /** Column order of extensions in the entities tables */
      columns?: string[];
    };

    /**
     * Progress bar style to use for percentage indicators
     *
     * @defaultValue 'circular'
     */
    progressStyle?: 'circular' | 'linear';
  };
}
