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
import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description: 'Template Example for annotating a catalog entity',
    example: yaml.stringify({
      steps: [
        {
          action: 'catalog:annotate',
          name: 'Annotate catalog-info.yaml.',
          input: {
            annotations: {
              'custom.io/annotation': 'annotationParameterValue',
            },
          },
        },
      ],
    }),
  },
  {
    description: 'Template Example for labeling a catalog entity',
    example: yaml.stringify({
      steps: [
        {
          action: 'catalog:annotate',
          name: 'Label catalog-info.yaml.',
          input: {
            labels: {
              custom: 'labelParameterValue',
            },
          },
        },
      ],
    }),
  },
  {
    description:
      'Template Example for adding additional spec information to a catalog entity',
    example: yaml.stringify({
      steps: [
        {
          action: 'catalog:annotate',
          name: 'Spec for catalog-info.yaml.',
          input: {
            spec: {
              owner: 'ownerParameterValue',
            },
          },
        },
      ],
    }),
  },
  {
    description:
      'Template Example for creating the entity object of a catalog entity',
    example: yaml.stringify({
      steps: [
        {
          action: 'catalog:annotate',
          name: 'Entity Object for catalog-info.yaml.',
          input: {
            objectYaml: {
              apiVersion: 'backstage.io/v1alpha1',
              kind: 'Component',
              metadata: {
                name: 'nameParameterValue',
                namespace: 'namespaceParameterValue',
              },
              spec: {},
            },
          },
        },
      ],
    }),
  },
  {
    description:
      'Template Example for adding specified label(s), annotation(s) and spec to a catalog entity using a file path to choose the entity yaml',
    example: yaml.stringify({
      steps: [
        {
          action: 'catalog:annotate',
          name: 'Annotate catalog-info.yaml.',
          input: {
            annotations: {
              'custom.io/annotation': 'annotationParameterValue',
            },
            labels: {
              custom: 'labelParameterValue',
            },
            spec: {
              owner: 'ownerParameterValue',
            },
            entityFilePath: 'path/to/entity/yaml',
          },
        },
      ],
    }),
  },
  {
    description:
      'Template Example for adding specified label(s), annotation(s) and spec to a catalog entity using a file path to choose and write the entity yaml',
    example: yaml.stringify({
      steps: [
        {
          action: 'catalog:annotate',
          name: 'Annotate catalog-info.yaml.',
          input: {
            annotations: {
              'custom.io/annotation': 'annotationParameterValue',
            },
            labels: {
              custom: 'labelParameterValue',
            },
            spec: {
              owner: 'ownerParameterValue',
            },
            entityFilePath: 'path/to/entity/yaml',
            writeToFile: 'path/to/write/to/file',
          },
        },
      ],
    }),
  },
];
