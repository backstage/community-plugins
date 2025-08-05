import express from 'express';
import { createConditionExports } from '@backstage/plugin-permission-node';
import {
  createPermissionIntegrationRouter,
  createConditionTransformer,
  ConditionTransformer,
} from '@backstage/plugin-permission-node';
import { rules, type FilterProps } from './rules';
import { RESOURCE_TYPE, mendReadPermission } from './permissions';

const { conditions, createConditionalDecision } = createConditionExports({
  pluginId: 'mend',
  resourceType: RESOURCE_TYPE.PROJECT,
  rules,
});

/** @public */
export const mendConditions = conditions;

/** @public */
export const createMendProjectConditionalDecision = createConditionalDecision;

export const permissionIntegrationRouter: express.Router =
  createPermissionIntegrationRouter({
    permissions: [mendReadPermission],
    getResources: async resourceRefs => {
      return resourceRefs.map(resourceRef => {
        return {
          permission: mendReadPermission,
          resourceRef,
        };
      });
    },
    resourceType: RESOURCE_TYPE.PROJECT,
    rules: Object.values(rules),
  });

export const transformConditions: ConditionTransformer<FilterProps> =
  createConditionTransformer(Object.values(rules));
