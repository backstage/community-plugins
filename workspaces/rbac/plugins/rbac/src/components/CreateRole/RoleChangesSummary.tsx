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
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import {
  isPermissionInfo,
  PermissionMapping,
  permissionMappingAction,
  RoleBasedPolicy,
} from '@backstage-community/plugin-rbac-common';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

import { rbacTranslationRef } from '../../alpha/translations';
import { useTranslation } from '../../hooks/useTranslation';
import { PermissionsData, RoleBasedConditions } from '../../types';
import { getPolicyString } from '../../utils/rbac-utils';
import {
  getRoleChanges,
  RoleChanges,
  RoleDetailField,
} from '../../utils/role-changes-utils';
import { RoleFormValues, SelectedMember } from './types';

type Translate = TranslationFunction<typeof rbacTranslationRef.T>;

type ChangeType = 'added' | 'removed' | 'changed';

type ChangeItem = {
  changeType: ChangeType;
  text: string;
};

type ChangeGroup = {
  title: string;
  items: ChangeItem[];
};

const changeTypeStyles: Record<ChangeType, { symbol: string; color: string }> =
  {
    added: { symbol: '+', color: 'success.dark' },
    removed: { symbol: '−', color: 'error.dark' },
    changed: { symbol: '~', color: 'info.dark' },
  };

const EMPTY_VALUE = '-';

const getFieldLabel = (field: RoleDetailField, t: Translate): string => {
  const labels: Record<RoleDetailField, string> = {
    name: t('roleForm.fields.name.label'),
    description: t('roleForm.fields.description.label'),
    owner: t('roleForm.fields.owner.label'),
  };
  return labels[field];
};

const formatMember = (member: SelectedMember): string =>
  `${member.label} (${member.type})`;

const formatPermission = (policy: RoleBasedPolicy): string =>
  `${policy.permission}: ${policy.policy} (${policy.effect})`;

const formatConditionalPolicy = (
  pluginId: string,
  permission: string,
  actions: string,
): string => `${pluginId}: ${permission} (${actions})`;

const formatCondition = (condition: RoleBasedConditions): string => {
  const mapping: PermissionMapping[] = condition.permissionMapping;
  return formatConditionalPolicy(
    condition.pluginId,
    mapping.find(isPermissionInfo)?.name ?? condition.resourceType,
    mapping.map(permissionMappingAction).join(', '),
  );
};

const formatConditionRow = (row: PermissionsData): string =>
  formatConditionalPolicy(
    row.plugin,
    row.permission,
    getPolicyString(row.policies).toLocaleLowerCase('en-US'),
  );

const getChangeGroups = (changes: RoleChanges, t: Translate): ChangeGroup[] => {
  const toItems = <T,>(
    changeType: ChangeType,
    entries: T[],
    format: (entry: T) => string,
  ): ChangeItem[] =>
    entries.map(entry => ({ changeType, text: format(entry) }));

  return [
    {
      title: t('roleForm.review.nameDescriptionOwner'),
      items: toItems('changed', changes.detailChanges, change =>
        t('roleForm.review.changes.valueChanged', {
          field: getFieldLabel(change.field, t),
          previous: change.previous || EMPTY_VALUE,
          current: change.current || EMPTY_VALUE,
        }),
      ),
    },
    {
      title: t('table.headers.usersAndGroups'),
      items: [
        ...toItems('added', changes.addedMembers, formatMember),
        ...toItems('removed', changes.removedMembers, formatMember),
      ],
    },
    {
      title: t('roleForm.review.changes.permissionPolicies'),
      items: [
        ...toItems('added', changes.addedPermissions, formatPermission),
        ...toItems('removed', changes.removedPermissions, formatPermission),
      ],
    },
    {
      title: t('roleForm.review.changes.conditionalPolicies'),
      items: [
        ...toItems('added', changes.addedConditions, formatCondition),
        ...toItems('removed', changes.removedConditions, ({ row }) =>
          formatConditionRow(row),
        ),
        ...toItems(
          'changed',
          changes.changedConditions,
          ({ updateCondition }) => formatCondition(updateCondition),
        ),
      ],
    },
  ].filter(group => group.items.length > 0);
};

const ChangeTypeLabel = ({ changeType }: { changeType: ChangeType }) => {
  const { t } = useTranslation();
  const { symbol, color } = changeTypeStyles[changeType];
  return (
    <Typography
      component="span"
      variant="body2"
      sx={{ color, fontWeight: 'bold', minWidth: '6rem', flexShrink: 0 }}
    >
      <Box component="span" aria-hidden="true">
        {symbol}{' '}
      </Box>
      {t(`roleForm.review.changes.${changeType}`)}
    </Typography>
  );
};

export const RoleChangesSummary = ({
  initialValues,
  values,
}: {
  initialValues: RoleFormValues;
  values: RoleFormValues;
}) => {
  const { t } = useTranslation();
  const changeGroups = getChangeGroups(
    getRoleChanges(initialValues, values),
    t,
  );

  return (
    <Box component="section" sx={{ marginBottom: 2 }}>
      <Typography
        variant="subtitle1"
        component="h3"
        sx={{ fontWeight: 'bold' }}
      >
        {t('roleForm.review.changes.title')}
      </Typography>
      {changeGroups.length > 0 ? (
        changeGroups.map(group => (
          <Box key={group.title} sx={{ marginTop: 1 }}>
            <Typography variant="subtitle2" component="h4">
              {group.title}
            </Typography>
            <List dense disablePadding>
              {group.items.map((item, index) => (
                <ListItem
                  key={`${item.changeType}-${item.text}-${index}`}
                  disableGutters
                  sx={{ gap: 1, alignItems: 'baseline' }}
                >
                  <ChangeTypeLabel changeType={item.changeType} />
                  <Typography variant="body2">{item.text}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        ))
      ) : (
        <Typography variant="body2">
          {t('roleForm.review.changes.noChanges')}
        </Typography>
      )}
    </Box>
  );
};
