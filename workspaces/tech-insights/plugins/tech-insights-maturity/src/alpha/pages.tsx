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
import { configApiRef, PageBlueprint } from '@backstage/frontend-plugin-api';
import { resolveMaturityDisplayConfig } from '../helpers/maturityConfig';

/**
 * Page extension for the maturity overview page.
 *
 * @alpha
 */
export const maturityPage = PageBlueprint.makeWithOverrides({
  factory(originalFactory, { apis, config }) {
    const { title } = resolveMaturityDisplayConfig(apis.get(configApiRef), {
      title: config.title,
    });

    return originalFactory({
      path: '/maturity',
      title,
      loader: () =>
        import('../components/MaturityPage').then(m =>
          compatWrapper(<m.MaturityPage title={title} />),
        ),
    });
  },
});
