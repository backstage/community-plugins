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
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

import { getObjectToAnnotate } from '../../utils/getObjectToAnnotate';
import { resolveSpec, Value } from '../../utils/resolveSpec';

/**
 * Creates a new Scaffolder action to annotate an entity object with specified label(s), annotation(s) and spec property(ies).
 *
 */

export const createAnnotatorAction = (
  actionId: string = 'catalog:annotate',
  actionDescription?: string,
  loggerInfoMsg?: string,
  annotateEntityObjectProvider?: () => {
    annotations?: { [key: string]: string };
    labels?: { [key: string]: string };
    spec?: { [key: string]: Value };
  },
) => {
  return createTemplateAction<{
    labels?: { [key: string]: string };
    annotations?: { [key: string]: string };
    spec?: { [key: string]: string };
    entityFilePath?: string;
    objectYaml?: { [key: string]: string };
    writeToFile?: string;
  }>({
    id: actionId,
    description:
      actionDescription ||
      'Creates a new scaffolder action to annotate the entity object with specified label(s), annotation(s) and spec property(ies).',
    schema: {
      input: {
        type: 'object',
        properties: {
          labels: {
            title: 'Labels',
            description:
              'Labels that will be applied to the `metadata.labels` of the entity object',
            type: 'object',
          },
          annotations: {
            title: 'Annotations',
            description:
              'Annotations that will be applied to the `metadata.annotations` of the entity object',
            type: 'object',
          },
          spec: {
            title: 'Spec',
            description:
              'Key-Value pair(s) that will be applied to the `spec` of the entity object',
            type: 'object',
          },
          entityFilePath: {
            title: 'Entity File Path',
            description: 'Path to the entity yaml you want to annotate',
            type: 'string',
          },
          objectYaml: {
            title: 'Object Yaml',
            description: 'Entity object yaml you want to annotate',
            type: 'object',
          },
          writeToFile: {
            title: 'Write To File',
            description:
              'Path to the file you want to write. Default path `./catalog-info.yaml`',
            type: 'string',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          annotatedObject: {
            type: 'object',
            title:
              'The entity object annotated with your desired annotation(s), label(s) and spec property(ies)',
          },
        },
      },
    },
    async handler(ctx) {
      const annotateEntityObject = annotateEntityObjectProvider?.();
      let objToAnnotate: { [key: string]: any };

      if (ctx.input?.objectYaml) {
        objToAnnotate = { ...ctx.input?.objectYaml };
      } else {
        objToAnnotate = await getObjectToAnnotate(
          ctx.workspacePath,
          ctx.input?.entityFilePath,
        );
      }
      const annotatedObj = {
        ...objToAnnotate,
        metadata: {
          ...objToAnnotate.metadata,
          annotations: {
            ...(objToAnnotate.metadata.annotations || {}),
            ...(annotateEntityObject?.annotations || {}),
            ...(ctx.input?.annotations || {}),
          },
          labels: {
            ...(objToAnnotate.metadata.labels || {}),
            ...(annotateEntityObject?.labels || {}),
            ...(ctx.input?.labels || {}),
          },
        },
        spec: {
          ...(objToAnnotate.spec || {}),
          ...resolveSpec(annotateEntityObject?.spec, ctx),
          ...(ctx.input?.spec || {}),
        },
      };

      const result = yaml.stringify(annotatedObj);
      if (
        Object.keys(
          annotateEntityObject?.labels ||
            annotateEntityObject?.annotations ||
            annotateEntityObject?.spec ||
            ctx.input?.labels ||
            ctx.input?.annotations ||
            ctx.input?.spec ||
            {},
        ).length > 0
      ) {
        ctx.logger.info(loggerInfoMsg || 'Annotating your object');

        await fs.writeFile(
          resolveSafeChildPath(
            ctx.workspacePath,
            ctx.input?.writeToFile || './catalog-info.yaml',
          ),
          result,
          'utf8',
        );
      }

      ctx.output('annotatedObject', result);
    },
  });
};
