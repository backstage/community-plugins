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
import useAsync from 'react-use/lib/useAsync';
import { linkerdPluginRef } from '../plugin';
import { useApi } from '@backstage/core-plugin-api';
import { useState } from 'react';
import useInterval from 'react-use/lib/useInterval';
import { Entity } from '@backstage/catalog-model';

export const useStatsForEntity = (entity: Entity) => {
  const l5d = useApi(linkerdPluginRef);
  const [counter, setCounter] = useState(0);
  const { value, loading, error } = useAsync(
    () => l5d.getStatsForEntity(entity),
    [counter, entity],
  );
  useInterval(() => {
    setCounter(counter + 1);
  }, 5000);

  return { stats: value, loading, error };
};
