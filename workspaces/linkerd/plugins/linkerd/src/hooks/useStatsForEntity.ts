import useAsync from 'react-use/lib/useAsync';
import { linkerdPluginRef } from '../plugin';
import { useApi } from '@backstage/core-plugin-api';
import { useState } from 'react';
import useInterval from 'react-use/lib/useInterval';
import { Entity } from '@backstage/catalog-model';

export const useStatsForEntity = (entity: Entity) => {
  const l5d = useApi(linkerdPluginRef);
  const [counter, setCounter] = useState(0);
  const { value, loading } = useAsync(
    () => l5d.getStatsForEntity(entity),
    [counter, entity],
  );
  useInterval(() => {
    setCounter(counter + 1);
  }, 5000);

  return { stats: value, loading };
};
