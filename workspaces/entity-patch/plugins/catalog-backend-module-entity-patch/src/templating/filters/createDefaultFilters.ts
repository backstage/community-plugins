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

/*
 * The filters below and their supporting files are copied from
 * @backstage/plugin-scaffolder-backend
 * (src/lib/templating/filters) so that entity-patch can register the same
 * Nunjucks templating filters without taking a runtime dependency on the
 * scaffolder backend package itself.
 *
 * If those filters are ever promoted to a shared library (e.g.
 * @backstage/plugin-scaffolder-node), this copy should be removed in favour
 * of the upstream export.
 */

import { ScmIntegrations } from '@backstage/integration';
import { createParseRepoUrl } from './parseRepoUrl';
import { parseEntityRef } from './parseEntityRef';
import { pick } from './pick';
import { createProjectSlug } from './projectSlug';

export const createDefaultFilters = (options: {
  integrations: ScmIntegrations;
}) => [
  createParseRepoUrl(options.integrations),
  parseEntityRef,
  pick,
  createProjectSlug(options.integrations),
];
