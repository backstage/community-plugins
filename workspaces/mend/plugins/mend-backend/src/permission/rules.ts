import { z } from 'zod';
import { makeCreatePermissionRule } from '@backstage/plugin-permission-node';
import { RESOURCE_TYPE } from './permissions';

type PermissionAttributes = {
  action?: 'create' | 'read' | 'update' | 'delete';
};

type ResourceProps = {
  permission: {
    type: string;
    name: string;
    attributes: PermissionAttributes;
    resourceType: typeof RESOURCE_TYPE.PROJECT;
  };
  resourceRef: string;
};

/** @public */
export type FilterProps = {
  ids: string[];
  exclude?: boolean;
};

export const createProjectPermissionRule = makeCreatePermissionRule<
  ResourceProps,
  FilterProps,
  typeof RESOURCE_TYPE.PROJECT
>();

export const filter = createProjectPermissionRule({
  name: 'filter',
  description: 'Should allow read-only access to filtered projects.',
  resourceType: RESOURCE_TYPE.PROJECT,
  paramsSchema: z.object({
    ids: z.string().array().describe('Project ID to match resource'),
    exclude: z.boolean().optional().describe('Exclude or include project'),
  }),
  apply: (resource, { ids, exclude = true }) => {
    return exclude
      ? !ids.includes(resource.resourceRef)
      : ids.includes(resource.resourceRef);
  },
  toQuery: ({ ids, exclude = true }) => {
    return {
      ids,
      exclude,
    };
  },
});

export const rules = { filter };
