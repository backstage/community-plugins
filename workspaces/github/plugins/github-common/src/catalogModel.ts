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

import { createCatalogModelLayer } from '@backstage/catalog-model/alpha';
import {
  GITHUB_PROJECT_SLUG_ANNOTATION,
  GITHUB_TEAM_SLUG_ANNOTATION,
  GITHUB_USER_LOGIN_ANNOTATION,
} from './constants';

/**
 * Catalog model layer declaring the annotations used by the GitHub plugins.
 *
 * @alpha
 */
export const githubCatalogModelLayer = createCatalogModelLayer({
  layerId: 'github.com/annotations',
  builder: model => {
    model.addAnnotation({
      name: GITHUB_PROJECT_SLUG_ANNOTATION,
      title: 'GitHub Project Slug',
      description:
        'The GitHub repository of the entity, in the format <owner>/<repo>. Used by the GitHub Actions, Deployments, Issues, and Pull Requests Board plugins.',
      schema: {
        jsonSchema: {
          type: 'string',
          pattern: '^[^/]+/[^/]+$',
        },
      },
    });
    model.addAnnotation({
      name: GITHUB_TEAM_SLUG_ANNOTATION,
      title: 'GitHub Team Slug',
      description:
        'The GitHub team of the entity, in the format <org>/<team>. Used by the GitHub Pull Requests Board plugin.',
      schema: {
        jsonSchema: {
          type: 'string',
          pattern: '^[^/]+/[^/]+$',
        },
      },
    });
    model.addAnnotation({
      name: GITHUB_USER_LOGIN_ANNOTATION,
      title: 'GitHub User Login',
      description:
        'The GitHub user login of the entity. Used by the GitHub Pull Requests Board plugin.',
      schema: {
        jsonSchema: {
          type: 'string',
          minLength: 1,
        },
      },
    });
  },
});
