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
