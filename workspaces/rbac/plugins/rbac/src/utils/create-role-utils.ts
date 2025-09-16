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
import * as yup from 'yup';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';

import {
  isResourcedPolicy,
  PluginPermissionMetaData,
  PolicyDetails,
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
import { capitalizeFirstLetter } from './string-utils';
import { rbacTranslationRef } from '../translations';

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
      owner: values.owner,
    },
  };
};

export const getValidationSchema = (
  t: TranslationFunction<typeof rbacTranslationRef.T>,
) =>
  yup.object({
    name: yup.string().required(t('common.nameRequired')),
    selectedMembers: yup.array().min(1, t('common.noMemberSelected')),
    selectedPlugins: yup.array().min(1, t('common.noPluginSelected')),
    permissionPoliciesRows: yup
      .array()
      .of(
        yup.object().shape({
          plugin: yup.string().required(t('common.pluginRequired')),
          permission: yup.string().required(t('common.permissionRequired')),
          policies: yup
            .array()
            .min(1)
            .of(
              yup
                .object()
                .shape({ policy: yup.string(), effect: yup.string() })
                .test(p => p.effect === 'allow'),
            ),
        }),
      )
      .min(1),
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
      const permission = policy.name;
      return {
        ...ppsAcc,
        [permission]: policies.reduce(
          (policiesAcc: { policies: string[]; isResourced: boolean }, pol) => {
            const perm = pol.name;
            if (permission === perm)
              return {
                policies: uniqBy(
                  [
                    ...policiesAcc.policies,
                    capitalizeFirstLetter(pol.policy as string),
                  ],
                  val => val,
                ),
                isResourced: isResourcedPolicy(pol),
                resourceType: isResourcedPolicy(pol) ? pol.resourceType : '',
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
        const permission = plc.name;
        return [...plcAcc, permission];
      }, []);
      return {
        ...acc,
        [plugins[index]]: {
          permissions: permissions ?? [],
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
  locale = 'en-US',
): RoleBasedPolicy[] => {
  const { kind, name, namespace, permissionPoliciesRows } = values;

  return permissionPoliciesRows.reduce(
    (acc: RoleBasedPolicy[], permissionPolicyRow) => {
      const {
        permission,
        policies,
        conditions,
        resourceType,
        usingResourceType,
      } = permissionPolicyRow;
      const permissionPoliciesData = policies.reduce(
        (pAcc: RoleBasedPolicy[], policy) => {
          if (policy.effect === 'allow' && !conditions) {
            return [
              ...pAcc,
              {
                entityReference: `${kind}:${namespace}/${name}`,
                permission:
                  resourceType && usingResourceType
                    ? `${resourceType}`
                    : `${permission}`,
                policy: policy.policy.toLocaleLowerCase(locale),
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
  locale = 'en-US',
) => {
  const { kind, name, namespace, permissionPoliciesRows } = values;

  return permissionPoliciesRows.reduce(
    (acc: RoleBasedConditions[], permissionPolicyRow: PermissionsData) => {
      const { policies, isResourced, plugin, conditions, resourceType } =
        permissionPolicyRow;
      const permissionMapping = policies.reduce((pAcc: string[], policy) => {
        if (policy.effect === 'allow') {
          return [...pAcc, policy.policy.toLocaleLowerCase(locale)];
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
              resourceType: `${resourceType}`,
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
