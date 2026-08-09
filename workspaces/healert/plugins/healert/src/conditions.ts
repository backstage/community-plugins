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
import { Entity } from '@backstage/catalog-model';

/**
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RULES
 * ─────────────────────────────────────────────────────────────────────────────
 *  API       → NEVER show. APIs are contracts, not deployable services.
 *              They share names with Components but have different entity refs
 *              (api:default/payments-api vs component:default/payments-api)
 *              and have no friction events in the backend.
 *
 *  Component → ALWAYS show. This is the primary entity kind for services.
 *
 *  Service   → ALWAYS show. Alternative kind used by some organizations.
 *
 *  Other     → Show only if annotation healert.io/enabled: 'true' is set.
 *              Useful for custom kinds like System, Resource, etc.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * USAGE IN plugin.ts
 * ─────────────────────────────────────────────────────────────────────────────
 *  import { isHealertAvailable } from './conditions';
 *
 *  >
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * OPT-IN ANNOTATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Add to catalog-info.yaml for non-Component/Service kinds:
 *
 *    metadata:
 *      annotations:
 *        healert.io/enabled: 'true'
 */
/** @public */
export function isHealertAvailable(entity: Entity): boolean {
  const kind = entity.kind?.toLowerCase();

  // Never show on API entities — APIs are contracts not deployable services.
  // They have no kubectl-exec, pipeline-skip, or deployment bypass events.
  if (kind === 'api') return false;

  // Always show on Component — the primary entity kind for services
  if (kind === 'component') return true;

  // Always show on Service — alternative kind used by some organizations
  if (kind === 'service') return true;

  // Allow explicit opt-in for any other kind via annotation
  return entity.metadata?.annotations?.['healert.io/enabled'] === 'true';
}
