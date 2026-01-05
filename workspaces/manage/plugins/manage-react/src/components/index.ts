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

export type { ManageAccordionProps } from './Accordion';
export { ManageAccordion } from './Accordion';

export type { CardWidgetProps } from './CardWidget';
export { CardWidget } from './CardWidget';

export type {
  ManageColumn,
  ManageColumnModuleMultiple,
  ManageColumnModuleSingle,
  ManageColumnModule,
  GetColumnsFunc,
  GetColumnFunc,
} from './column-providers/types';

export { ColumnSkeleton } from './ColumnSkeleton';

export type { KindStarredType } from './CurrentKindProvider';
export {
  CurrentKindProvider,
  useCurrentKind,
  useCurrentKinds,
  useCurrentKindTitle,
  useCurrentTab,
  KindStarred,
} from './CurrentKindProvider';

export type {
  ManageGaugeCardProps,
  ManageGaugeCard,
  GaugeCardProps,
} from './GaugeCard';
export type { ManageGaugeGrid, ManageGaugeGridProps } from './GaugeGrid';

export type * from './icons';
export * from './icons';

export { KindOrderProvider, useSetKindOrder, useKindOrder } from './KindOrder';

export {
  useOwnedKinds,
  useOwnersAndEntities,
  useOwnedEntities,
  useManagedEntities,
  useOwners,
} from './OwnedProvider';

export type { OwnedProviderProps, ManageOwnedProvider } from './OwnedProvider';

export { Progress } from './Progress';

export type {
  ReorderableTabsProps,
  ManageReorderableTabs,
} from './ReorderableTabs';

export type {
  ManageTabContentFullHeight,
  TabContentFullHeightProps,
  UsePositionClientSize,
  UsePositionElementPosition,
  UsePositionResult,
} from './TabContentFullHeight';
export { usePosition } from './TabContentFullHeight';

export type {
  CreateUserSettingsContextOptions,
  UserSettingsDefaultValueGetter,
  UserSettingsDefaultValue,
  UserSettingsContextResult,
  UserSettingsProviderProps,
} from './UserSettingsProvider';
export { createUserSettingsContext } from './UserSettingsProvider';
