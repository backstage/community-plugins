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
import { compatWrapper } from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * Entity content extension for maturity scorecards.
 *
 * @alpha
 */
export const entityMaturityScorecardContent = EntityContentBlueprint.make({
  name: 'maturity',
  params: {
    filter: { kind: 'Component' },
    path: '/maturity',
    title: 'Maturity',
    loader: () =>
      import('../ScoreRouter').then(m => compatWrapper(<m.ScoreRouter />)),
  },
});
