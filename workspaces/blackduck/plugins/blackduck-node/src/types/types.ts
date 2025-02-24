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
 * @public
 */
export type META = {
  allow: [];
  href: string;
  links: [];
};

/**
 * @public
 */
export type BD_PROJECT_DETAIL = {
  name: string;
  projectLevelAdjustments: string;
  cloneCategories: [];
  customSignatureEnabled: string;
  customSignatureDepth: string;
  deepLicenseDataEnabled: string;
  snippetAdjustmentApplied: string;
  licenseConflictsEnabled: string;
  projectGroup: string;
  createdAt: string;
  createdBy: string;
  createdByUser: string;
  updatedAt: string;
  updatedBy: string;
  updatedByUser: string;
  source: string;
  _meta: META;
};

/**
 * @public
 */
export type BD_VERISON_DETAIL = {
  versionName: string;
  phase: string;
  distribution: string;
  license: [];
  createdAt: string;
  createdBy: string;
  createdByUser: string;
  settingUpdatedAt: string;
  settingUpdatedBy: string;
  settingUpdatedByUser: string;
  source: string;
  _meta: META;
};

/**
 * @public
 */
export type BD_REST_API_RESPONSE = {
  totalCount: Number;
  items: [];
  appliedFilters: [];
  _meta: META;
};

/**
 * @public
 */
export type BD_PROJECTS_API_RESPONSE = {
  totalCount: Number;
  items: BD_PROJECT_DETAIL[];
  appliedFilters: [];
  _meta: META;
};

/**
 * @public
 */
export type BD_VERSIONS_API_RESPONSE = {
  totalCount: Number;
  items: BD_VERISON_DETAIL[];
  appliedFilters: [];
  _meta: META;
};

/**
 * @public
 */
export type BD_CREATE_PROJECT_API_RESPONSE = {
  status: Number;
  location?: String;
};
