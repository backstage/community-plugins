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
import useAsyncRetry from 'react-use/lib/useAsync';

import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { maturityApiRef } from '../../api';
import { MaturityRankChip } from '../MaturityRankChip';

type Props = {
  entity: Entity;
};

export const MaturityRankWidget = ({ entity }: Props) => {
  const api = useApi(maturityApiRef);

  const { value, loading } = useAsyncRetry(
    async () => api.getMaturityRank(entity),
    [api, entity],
  );

  if (loading || !value) return <></>;

  return <MaturityRankChip entity={entity} value={value} />;
};
