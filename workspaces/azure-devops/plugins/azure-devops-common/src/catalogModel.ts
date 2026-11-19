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
  AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION,
  AZURE_DEVOPS_HOST_ORG_ANNOTATION,
  AZURE_DEVOPS_PROJECT_ANNOTATION,
  AZURE_DEVOPS_README_ANNOTATION,
  AZURE_DEVOPS_REPO_ANNOTATION,
} from './constants';

/**
 * Catalog model layer declaring the annotations used by the Azure DevOps
 * plugins.
 *
 * @alpha
 */
export const azureDevOpsCatalogModelLayer = createCatalogModelLayer({
  layerId: 'dev.azure.com/annotations',
  builder: model => {
    model.addAnnotation({
      name: AZURE_DEVOPS_REPO_ANNOTATION,
      title: 'Azure DevOps Project and Repository',
      description:
        'The Azure DevOps project and Git repository of the entity, in the format <project-name>/<repo-name>.',
      schema: {
        jsonSchema: {
          type: 'string',
          pattern: '^[^/]+/[^/]+$',
        },
      },
    });
    model.addAnnotation({
      name: AZURE_DEVOPS_PROJECT_ANNOTATION,
      title: 'Azure DevOps Project',
      description:
        'The Azure DevOps project of the entity. Used together with the build definition annotation.',
      schema: {
        jsonSchema: {
          type: 'string',
          minLength: 1,
        },
      },
    });
    model.addAnnotation({
      name: AZURE_DEVOPS_BUILD_DEFINITION_ANNOTATION,
      title: 'Azure DevOps Build Definition',
      description:
        'The name of the Azure Pipelines build definition of the entity. Requires the project or project-repo annotation.',
      schema: {
        jsonSchema: {
          type: 'string',
          minLength: 1,
        },
      },
    });
    model.addAnnotation({
      name: AZURE_DEVOPS_HOST_ORG_ANNOTATION,
      title: 'Azure DevOps Host and Organization',
      description:
        'The Azure DevOps host and organization of the entity, in the format <host-name>/<organization-name>. Overrides the default host and organization from configuration.',
      schema: {
        jsonSchema: {
          type: 'string',
          pattern: '^[^/]+(/[^/]+)?/[^/]+$',
        },
      },
    });
    model.addAnnotation({
      name: AZURE_DEVOPS_README_ANNOTATION,
      title: 'Azure DevOps README Path',
      description:
        'The path to the README file in the Azure DevOps repository of the entity. Defaults to the README in the source location or repository root. An empty value disables this auto-detection.',
      schema: {
        jsonSchema: {
          type: 'string',
        },
      },
    });
  },
});
