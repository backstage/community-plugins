import { makeFieldSchemaFromZod } from '@backstage/plugin-scaffolder';
import { z } from 'zod';

export const DevfileSelectorExtensionWithOptionsFieldSchema =
  makeFieldSchemaFromZod(
    z.object({
      devfile: z.string().describe('Devfile name'),
      version: z.string().describe('Devfile Stack version'),
      starterProject: z
        .string()
        .optional()
        .describe('Devfile Stack starter project'),
    }),
  );

export const DevfileSelectorExtensionWithOptionsSchema =
  DevfileSelectorExtensionWithOptionsFieldSchema.schema;
