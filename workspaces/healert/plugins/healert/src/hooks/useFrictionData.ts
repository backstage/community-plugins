import { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { healertApiRef } from '../api';
import type { FrictionData, HealertApiResponse } from '../api/types';

/**
 * Hook that fetches friction data for the current Backstage entity.
 *
 * Reads the entity ref dynamically from the Backstage EntityProvider context.
 * Reads the backend URL from Backstage config (healert.baseUrl or proxy).
 *
 * Must be used inside an EntityProvider context (i.e., on an entity page).
 *
 * @returns HealertApiResponse containing the friction data, loading state,
 *          and any error message.
 */
export function useFrictionData(): HealertApiResponse<FrictionData> {
  const { entity } = useEntity();
  const healertApi = useApi(healertApiRef);

  const [state, setState] = useState<HealertApiResponse<FrictionData>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    // Dynamically resolve entity ref from context
    const entityRef = stringifyEntityRef(entity);

    setState({ data: null, error: null, loading: true });

    healertApi
      .getFrictionData(entityRef)
      .then(data => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((err: Error) => {
        if (!cancelled) {
          // Translate Backstage proxy errors into actionable operator messages.
          // Raw errors like "api handler error" are meaningless to a platform
          // engineer — replace them with clear instructions.
          const raw = (err.message ?? '').toLowerCase();
          let friendly: string;

          if (
            raw.includes('api handler') ||
            raw.includes('failed to fetch') ||
            raw.includes('load failed') ||
            raw.includes('networkerror') ||
            raw.includes('network request') ||
            raw.includes('econnrefused') ||
            raw.includes('connection') ||
            raw.includes('timeout') ||
            raw.includes('gateway') ||
            raw.includes('502') ||
            raw.includes('503') ||
            raw.includes('504')
          ) {
            friendly = 'backend-unreachable';
          } else if (raw.includes('401') || raw.includes('unauthorized')) {
            friendly = 'auth-error';
          } else if (raw.includes('404')) {
            friendly = 'not-found';
          } else {
            friendly = err.message || 'unknown-error';
          }

          setState({ data: null, error: friendly, loading: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entity, healertApi]);

  return state;
}
