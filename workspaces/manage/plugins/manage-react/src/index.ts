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
export type * from './api';
export * from './api';

export * from './plugin';

export type { ManageAccordionProps } from './components/Accordion';
export { ManageAccordion } from './components/Accordion';

export type * from './components/CurrentKindProvider';
export * from './components/CurrentKindProvider';

export {
  KindOrderProvider,
  useSetKindOrder,
  useKindOrder,
} from './components/KindOrder';

export {
  useOwnedKinds,
  useOwnedEntities,
  useManagedEntities,
  useOwners,
} from './components/OwnedProvider';

export type {
  OwnedProviderProps,
  ManageOwnedProvider,
} from './components/OwnedProvider';

export type {
  ManageGaugeCardProps,
  ManageGaugeCard,
  GaugeCardProps,
} from './components/GaugeCard';
export type {
  ManageGaugeGrid,
  ManageGaugeGridProps,
} from './components/GaugeGrid';

export type * from './components/icons';
export * from './components/icons';

export type {
  ReorderableTabsProps,
  ManageReorderableTabs,
} from './components/ReorderableTabs';

export type {
  ManageTabContentFullHeight,
  TabContentFullHeightProps,
  UsePositionClientSize,
  UsePositionElementPosition,
  UsePositionResult,
} from './components/TabContentFullHeight';
export { usePosition } from './components/TabContentFullHeight';

export type {
  CreateUserSettingsContextOptions,
  UserSettingsContextResult,
} from './components/UserSettingsProvider';
export { createUserSettingsContext } from './components/UserSettingsProvider';

export type {
  ItemWithKey,
  UseOrderOptions,
  UseUserSettingsOptions,
} from './hooks';
export { useAccordionKey, useOrder, useUserSettings } from './hooks';

export type {
  ManageColumn,
  ManageColumnModuleMultiple,
  ManageColumnModuleSingle,
  ManageColumnModule,
  GetColumnsFunc,
  GetColumnFunc,
} from './components/column-providers/types';
export {
  isManageColumnModuleMultiple,
  simplifyColumns,
} from './components/column-providers/types';

export { arrayify, pluralizeKind } from './utils';
