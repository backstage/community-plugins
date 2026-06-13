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
 * Healert Friction Intelligence Platform plugin for Backstage.
 *
 * @packageDocumentation
 */

/** @public */
export { healertPlugin, healertApiExtension } from './plugin';
/** @public */
export { FrictionScoreCard } from './components/FrictionScoreCard';
/** @public */
export { FrictionHeatmap } from './components/FrictionHeatmap';
/** @public */
export { isHealertAvailable } from './conditions';
/** @public */
export { healertApiRef } from './api';
/** @public */
export { MockHealertClient } from './api/HealertClient';
/** @public */
export type {
  FrictionScore,
  FrictionData,
  BypassEvent,
  FrictionSeverity,
} from './api/types';
/** @public */
export type { HealertApi } from './api/HealertClient';
/** @public */
export { EntityHealertContent } from './components/EntityHealertContent/EntityHealertContent';
