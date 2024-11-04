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
import { getTitleCase } from '@janus-idp/shared-react';
import * as yup from 'yup';

import {
  isResourcedPolicy,
  PluginPermissionMetaData,
  PolicyDetails,
  ResourcedPolicy,
  Role,
  RoleBasedPolicy,
} from '@backstage-community/plugin-rbac-common';

import { criterias } from '../components/ConditionalAccess/const';
import { ConditionsData } from '../components/ConditionalAccess/types';
import {
  PermissionPolicies,
  PluginsPermissionPoliciesData,
  PluginsPermissions,
  RoleFormValues,
  SelectedMember,
} from '../components/CreateRole/types';
import {
  MemberEntity,
  PermissionsData,
  RoleBasedConditions,
  UpdatedConditionsData,
} from '../types';

export const uniqBy = (arr: string[], iteratee: (arg: string) => any) => {
  return arr.filter(
    (x, i, self) => i === self.findIndex(y => iteratee(x) === iteratee(y)),
  );
};

export const getRoleData = (values: RoleFormValues): Role => {
  return {
    memberReferences: values.selectedMembers.map(
      (mem: SelectedMember) => mem.ref,
    ),
    name: `${values.kind}:${values.namespace}/${values.name}`,
    metadata: {
      description: values.description,
    },
  };
};

export const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  selectedMembers: yup.array().min(1, 'No member selected'),
  permissionPoliciesRows: yup.array().of(
    yup.object().shape({
      plugin: yup.string().required('Plugin is required'),
      permission: yup.string().required('Permission is required'),
    }),
  ),
});

export const getMembersCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'hasMember') {
          temp++;
        }
        return temp;
      }, 0)
    : undefined;
};

export const getParentGroupsCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'childOf') {
          temp++;
        }
        return temp;
      }, 0)
    : undefined;
};

export const getChildGroupsCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'parentOf') {
          temp++;
        }
        return temp;
      }, 0)
    : undefined;
};

export const getPermissionPolicies = (
  policies: PolicyDetails[],
): PermissionPolicies => {
  return policies.reduce(
    (ppsAcc: PermissionPolicies, policy: PolicyDetails) => {
      const permission = isResourcedPolicy(policy)
        ? (policy as ResourcedPolicy).resourceType
        : policy.name;
      return {
        ...ppsAcc,
        [permission]: policies.reduce(
          (policiesAcc: { policies: string[]; isResourced: boolean }, pol) => {
            const perm = isResourcedPolicy(pol)
              ? (pol as ResourcedPolicy).resourceType
              : pol.name;
            if (permission === perm)
              return {
                policies: uniqBy(
                  [...policiesAcc.policies, getTitleCase(pol.policy as string)],
                  val => val,
                ),
                isResourced: isResourcedPolicy(pol),
              };
            return policiesAcc;
          },
          { policies: [], isResourced: false },
        ),
      };
    },
    {},
  );
};

export const getPluginsPermissionPoliciesData = (
  pluginsPermissionPolicies: PluginPermissionMetaData[],
): PluginsPermissionPoliciesData => {
  const plugins: string[] = pluginsPermissionPolicies.map(
    pluginPp => pluginPp.pluginId,
  );
  const pluginsPermissions = pluginsPermissionPolicies.reduce(
    (acc: PluginsPermissions, pp, index) => {
      const permissions = pp.policies.reduce((plcAcc: string[], plc) => {
        const permission = isResourcedPolicy(plc)
          ? (plc as ResourcedPolicy).resourceType
          : plc.name;
        return [...plcAcc, permission];
      }, []);
      return {
        ...acc,
        [plugins[index]]: {
          permissions: uniqBy(permissions ?? [], val => val),
          policies: {
            ...(pp.policies ? getPermissionPolicies(pp.policies) : {}),
          },
        },
      };
    },
    {},
  );
  return { plugins, pluginsPermissions };
};

export const getPermissionPoliciesData = (
  values: RoleFormValues,
): RoleBasedPolicy[] => {
  const { kind, name, namespace, permissionPoliciesRows } = values;

  return permissionPoliciesRows.reduce(
    (acc: RoleBasedPolicy[], permissionPolicyRow) => {
      const { permission, policies, conditions } = permissionPolicyRow;
      const permissionPoliciesData = policies.reduce(
        (pAcc: RoleBasedPolicy[], policy) => {
          if (policy.effect === 'allow' && !conditions) {
            return [
              ...pAcc,
              {
                entityReference: `${kind}:${namespace}/${name}`,
                permission: `${permission}`,
                policy: policy.policy.toLocaleLowerCase('en-US'),
                effect: 'allow',
              },
            ];
          }
          return pAcc;
        },
        [],
      );
      return [...acc, ...permissionPoliciesData];
    },
    [],
  );
};

export const getConditionalPermissionPoliciesData = (
  values: RoleFormValues,
) => {
  const { kind, name, namespace, permissionPoliciesRows } = values;

  return permissionPoliciesRows.reduce(
    (acc: RoleBasedConditions[], permissionPolicyRow: PermissionsData) => {
      const { permission, policies, isResourced, plugin, conditions } =
        permissionPolicyRow;
      const permissionMapping = policies.reduce((pAcc: string[], policy) => {
        if (policy.effect === 'allow') {
          return [...pAcc, policy.policy.toLocaleLowerCase('en-US')];
        }
        return pAcc;
      }, []);
      return isResourced && conditions
        ? [
            ...acc,
            {
              result: 'CONDITIONAL',
              roleEntityRef: `${kind}:${namespace}/${name}`,
              pluginId: `${plugin}`,
              resourceType: `${permission}`,
              permissionMapping,
              conditions:
                Object.keys(conditions)[0] === criterias.condition
                  ? { ...conditions.condition }
                  : conditions,
            } as RoleBasedConditions,
          ]
        : acc;
    },
    [] as RoleBasedConditions[],
  );
};

export const getUpdatedConditionalPolicies = (
  values: RoleFormValues,
  initialValues: RoleFormValues,
): UpdatedConditionsData => {
  const initialConditionsWithId = initialValues.permissionPoliciesRows.filter(
    ppr => ppr.id,
  );

  const conditionsWithId = values.permissionPoliciesRows.filter(ppr => ppr.id);

  return conditionsWithId.length > 0
    ? conditionsWithId.reduce(
        (
          acc: { id: number; updateCondition: RoleBasedConditions }[],
          condition: PermissionsData,
        ) => {
          const conditionExists = initialConditionsWithId.find(
            c => c.id === condition.id,
          );

          if (conditionExists && condition.id)
            return [
              ...acc,
              {
                id: condition.id,
                updateCondition: getConditionalPermissionPoliciesData({
                  ...values,
                  permissionPoliciesRows: [condition],
                })[0],
              },
            ];
          return acc;
        },
        [],
      )
    : [];
};

export const getNewConditionalPolicies = (values: RoleFormValues) => {
  const newValues = { ...values };
  const newPermissionPolicies = values.permissionPoliciesRows.filter(
    ppr => !ppr.id,
  );
  newValues.permissionPoliciesRows = newPermissionPolicies;
  return getConditionalPermissionPoliciesData(newValues);
};

export const getRemovedConditionalPoliciesIds = (
  values: RoleFormValues,
  initialValues: RoleFormValues,
) => {
  const initialConditionsIds = initialValues.permissionPoliciesRows
    .map(ppr => ppr.id)
    .filter(id => id);

  const newConditionsIds = values.permissionPoliciesRows
    .map(ppr => ppr.id)
    .filter(id => id);

  return initialConditionsIds.length > 0
    ? initialConditionsIds.reduce((acc: number[], oldId) => {
        const conditionExists = newConditionsIds.includes(oldId);
        if (conditionExists) return acc;
        return oldId ? [...acc, oldId] : acc;
      }, [])
    : [];
};

export const getPermissionsNumber = (values: RoleFormValues) => {
  return (
    getPermissionPoliciesData(values).length +
    getConditionalPermissionPoliciesData(values).length
  );
};

export const getConditionsNumber = (values: RoleFormValues) => {
  return getConditionalPermissionPoliciesData(values)?.length ?? 0;
};

export const getRulesNumber = (conditions?: ConditionsData) => {
  if (!conditions) return 0;
  let rulesNumber = 0;

  if (conditions.allOf) {
    rulesNumber += conditions.allOf.reduce((acc, condition) => {
      return acc + getRulesNumber(condition as ConditionsData);
    }, 0);
  }

  if (conditions.anyOf) {
    rulesNumber += conditions.anyOf.reduce((acc, condition) => {
      return acc + getRulesNumber(condition as ConditionsData);
    }, 0);
  }

  if (conditions.not) {
    rulesNumber += getRulesNumber(conditions.not as ConditionsData);
  }

  if (conditions.condition || Object.keys(conditions).includes('rule')) {
    rulesNumber += 1;
  }

  return rulesNumber;
};
