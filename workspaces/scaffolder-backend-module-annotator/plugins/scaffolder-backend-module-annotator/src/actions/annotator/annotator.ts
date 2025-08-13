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
import {
  createTemplateAction,
  TemplateExample,
} from '@backstage/plugin-scaffolder-node';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

import { getObjectToAnnotate } from '../../utils/getObjectToAnnotate';
import { resolveSpec } from '../../utils/resolveSpec';
import { resolveAnnotation } from '../../utils/resolveAnnotation';
import { Value } from '../../types';

/**
 * @public
 * Creates a new Scaffolder action to annotate an entity object with specified label(s), annotation(s) and spec property(ies).
 *
 */
export const createAnnotatorAction = (
  actionId: string = 'catalog:annotate',
  actionDescription?: string,
  loggerInfoMsg?: string,
  annotateEntityObjectProvider?: () => {
    annotations?: { [key: string]: Value };
    labels?: { [key: string]: string };
    spec?: { [key: string]: Value };
  },
  examples?: TemplateExample[],
) => {
  return createTemplateAction({
    id: actionId,
    examples,
    description:
      actionDescription ||
      'Creates a new scaffolder action to annotate the entity object with specified label(s), annotation(s) and spec property(ies).',
    schema: {
      input: {
        labels: z =>
          z
            .record(z.string(), z.string())
            .optional()
            .describe(
              'Labels that will be applied to the `metadata.labels` of the entity object',
            ),
        annotations: z =>
          z
            .record(z.string(), z.string())
            .optional()
            .describe(
              'Annotations that will be applied to the `metadata.annotations` of the entity object',
            ),
        spec: z =>
          z
            .record(z.string(), z.any())
            .optional()
            .describe(
              'Key-Value pair(s) that will be applied to the `spec` of the entity object',
            ),
        entityFilePath: z =>
          z
            .string()
            .optional()
            .describe('Path to the entity yaml you want to annotate'),
        objectYaml: z =>
          z
            .record(z.string(), z.any())
            .optional()
            .describe('Entity object yaml you want to annotate'),
        writeToFile: z =>
          z
            .string()
            .optional()
            .describe(
              'Path to the file you want to write. Default path `./catalog-info.yaml`',
            ),
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
            ...resolveAnnotation(annotateEntityObject?.annotations, ctx),
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
