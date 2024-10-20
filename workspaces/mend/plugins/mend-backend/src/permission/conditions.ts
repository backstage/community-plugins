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

export const mendConditions = conditions;

export const createMendProjectConditionalDecision = createConditionalDecision;

export const permissionIntegrationRouter = createPermissionIntegrationRouter({
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
