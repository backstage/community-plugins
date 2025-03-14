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

export * from './plugin';

export type {
  TableRow,
  ManageEntitiesTableProps,
  TableColumn,
  ManageColumnSimpleComponentProps,
  ManageColumnSimpleComponent,
  ManageColumnSimple,
} from './components/ManageEntitiesList';

export type {
  ManagePageProps,
  HeaderProps,
  ManagePageImpl,
} from './components/ManagePage';

export type { SwitchColor } from './components/ManagePageFilters';
export {
  ManagePageFilters,
  useManagePageCombined,
} from './components/ManagePageFilters';

export type {
  SubRouteTab,
  ManageTabsProps,
  ManageKindOptions,
  ManageTabsImpl,
} from './components/ManageTabs';

export type {
  OrganizationGraphProps,
  OrganizationGraphImpl,
} from './components/OrganizationGraph';

export { MANAGE_KIND_COMMON } from './components/ManageTabs';

export {
  DefaultSettings,
  KindOrderCard,
  TabOrderCard,
} from './components/Settings';
