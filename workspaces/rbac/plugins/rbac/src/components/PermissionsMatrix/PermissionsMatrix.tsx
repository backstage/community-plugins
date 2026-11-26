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
import { useDeferredValue, useMemo, useState } from 'react';

import { Link, Progress, WarningPanel } from '@backstage/core-components';
import {
  Checkbox,
  CheckboxGroup,
  Flex,
  Focusable,
  type Key,
  SearchField,
  Select,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@backstage/ui';
import { RiLockLine } from '@remixicon/react';

import { useLanguage } from '../../hooks/useLanguage';
import { usePermissionsMatrix } from '../../hooks/usePermissionsMatrix';
import { useTranslation } from '../../hooks/useTranslation';
import {
  filterPermissionsMatrix,
  getMatrixCell,
  getShortRoleName,
  MatrixDecision,
  MatrixPluginGroup,
  MatrixRow,
  searchMatrixRows,
} from '../../utils/permissions-matrix-utils';
import { getRoleOverviewPath } from '../../utils/rbac-utils';
import {
  getRoleSourceActionTooltip,
  getRoleSourceLabel,
} from '../../utils/role-source-utils';
import {
  DecisionLabels,
  MatrixDecisionCell,
  MatrixLegend,
  useDecisionLabels,
} from './MatrixDecision';
import styles from './PermissionsMatrix.module.css';

const ALL_PLUGINS = 'all';
const ALL_POLICIES = 'all';
// 'none' is not offered: with no policy on most permissions it matches nearly
// every column, so the option would look broken until roles are checked.
const DECISION_FILTERS: MatrixDecision[] = ['allow', 'deny', 'conditional'];

const ViewOnlyRoleIndicator = ({ source }: { source: string }) => {
  const { t } = useTranslation();
  return (
    <TooltipTrigger delay={300}>
      <Focusable>
        <Text
          as="span"
          role="img"
          aria-label={`${t('permissionsMatrix.viewOnlyRole')}: ${getRoleSourceLabel(source, t)}`}
          className={styles.tooltipTarget}
        >
          <RiLockLine size={16} aria-hidden />
        </Text>
      </Focusable>
      <Tooltip>{getRoleSourceActionTooltip(source, t)}</Tooltip>
    </TooltipTrigger>
  );
};

const MatrixTable = ({
  plugins,
  rows,
  labels,
}: {
  plugins: MatrixPluginGroup[];
  rows: MatrixRow[];
  labels: DecisionLabels;
}) => {
  const { t } = useTranslation();
  const columns = plugins.flatMap(plugin => plugin.columns);
  const conditionalRulesLabel = t('permissionsMatrix.conditionalRules');

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" rowSpan={2} className={styles.roleCell}>
              {t('permissionsMatrix.roleColumn')}
            </th>
            {plugins.map(plugin => (
              <th
                key={plugin.pluginId}
                scope="colgroup"
                colSpan={plugin.columns.length}
                className={styles.pluginHeader}
              >
                {plugin.pluginId}
              </th>
            ))}
          </tr>
          <tr>
            {columns.map(column => (
              <th key={column.id} scope="col">
                {column.permission}
                <Text
                  as="span"
                  variant="body-small"
                  color="secondary"
                  className={styles.permissionAction}
                >
                  {column.action}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.roleName}>
              <th scope="row" className={styles.roleCell}>
                <Flex align="center" gap="1">
                  <Link to={getRoleOverviewPath(row.roleName)}>
                    {row.roleName}
                  </Link>
                  {!row.editable && (
                    <ViewOnlyRoleIndicator source={row.source} />
                  )}
                </Flex>
              </th>
              {columns.map(column => (
                <td key={column.id} className={styles.decisionCell}>
                  <MatrixDecisionCell
                    cell={getMatrixCell(row, column.id)}
                    labels={labels}
                    conditionalRulesLabel={conditionalRulesLabel}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Read-only roles × permissions overview, with permissions grouped by plugin. */
export const PermissionsMatrix = () => {
  const { t } = useTranslation();
  const locale = useLanguage();
  const { loading, matrix, error } = usePermissionsMatrix();
  const labels = useDecisionLabels();
  const [roleSearch, setRoleSearch] = useState('');
  // Keeps typing responsive while large matrices re-render.
  const deferredRoleSearch = useDeferredValue(roleSearch);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [pluginFilter, setPluginFilter] = useState<string>(ALL_PLUGINS);
  const [decisionFilter, setDecisionFilter] = useState<string>(ALL_POLICIES);

  const pluginOptions = useMemo(
    () => [
      { id: ALL_PLUGINS, label: t('permissionsMatrix.allPlugins') },
      ...(matrix?.plugins ?? []).map(({ pluginId }) => ({
        id: pluginId,
        label: pluginId,
      })),
    ],
    [matrix, t],
  );

  const decisionOptions = useMemo(
    () => [
      { id: ALL_POLICIES, label: t('permissionsMatrix.allPolicies') },
      ...DECISION_FILTERS.map(decision => ({
        id: decision,
        label: labels[decision],
      })),
    ],
    [labels, t],
  );

  // The checkbox list follows the same search as the table, so the two
  // controls agree about which roles are in play.
  const sidebarRows = useMemo(
    () => searchMatrixRows(matrix?.rows ?? [], deferredRoleSearch, locale),
    [matrix, deferredRoleSearch, locale],
  );

  // A checked role the search hides is ignored instead of ANDing the two
  // controls into an empty table; the box stays checked and applies again
  // once the search clears.
  const effectiveSelectedRoles = useMemo(
    () =>
      selectedRoles.filter(name =>
        sidebarRows.some(row => row.roleName === name),
      ),
    [selectedRoles, sidebarRows],
  );

  const filtered = useMemo(
    () =>
      matrix &&
      // sidebarRows already carries the role search, so the search runs once
      // and both the sidebar and the table share its result.
      filterPermissionsMatrix(
        { ...matrix, rows: sidebarRows },
        {
          roleNames: effectiveSelectedRoles,
          pluginId: pluginFilter === ALL_PLUGINS ? undefined : pluginFilter,
          decision: DECISION_FILTERS.find(d => d === decisionFilter),
        },
        locale,
      ),
    [
      matrix,
      sidebarRows,
      effectiveSelectedRoles,
      pluginFilter,
      decisionFilter,
      locale,
    ],
  );

  const toSingleValue = (value: Key | Key[] | null) => {
    const next = Array.isArray(value) ? value[0] : value;
    return next ? String(next) : undefined;
  };
  const handlePluginChange = (value: Key | Key[] | null) =>
    setPluginFilter(toSingleValue(value) ?? ALL_PLUGINS);
  const handleDecisionChange = (value: Key | Key[] | null) =>
    setDecisionFilter(toSingleValue(value) ?? ALL_POLICIES);

  if (error) {
    return (
      <WarningPanel
        severity="error"
        title={error.title}
        message={error.message}
      />
    );
  }
  if (loading || !matrix || !filtered) {
    return <Progress />;
  }

  // With the selection narrowed to the searched rows, the role list only
  // comes out empty when the search itself matches no role, and then the
  // missing roles are the message, not the filters.
  let emptyMessage: string | undefined;
  if (!matrix.plugins.length) {
    emptyMessage = t('permissionsMatrix.emptyPermissions');
  } else if (!sidebarRows.length) {
    emptyMessage = t('permissionsMatrix.emptyRoles');
  } else if (!filtered.plugins.length || !filtered.rows.length) {
    emptyMessage = t('permissionsMatrix.noMatches');
  }

  return (
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="1">
        <Text as="h2" variant="title-small">
          {t('permissionsMatrix.title')}
        </Text>
        <Text as="p" variant="body-medium">
          {t('permissionsMatrix.description')}
        </Text>
      </Flex>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <SearchField
            aria-label={t('permissionsMatrix.filterRoles')}
            placeholder={t('permissionsMatrix.filterRoles')}
            value={roleSearch}
            onChange={setRoleSearch}
          />
          <CheckboxGroup
            label={t('permissionsMatrix.roles')}
            value={selectedRoles}
            onChange={setSelectedRoles}
            className={styles.roleList}
          >
            {sidebarRows.map(row => (
              <Checkbox key={row.roleName} value={row.roleName}>
                <Text as="span" title={row.roleName}>
                  {getShortRoleName(row.roleName)}
                </Text>
              </Checkbox>
            ))}
          </CheckboxGroup>
          <Select
            label={t('permissionsMatrix.plugin')}
            options={pluginOptions}
            value={pluginFilter}
            onChange={handlePluginChange}
          />
          <Select
            label={t('permissionsMatrix.policy')}
            options={decisionOptions}
            value={decisionFilter}
            onChange={handleDecisionChange}
          />
        </aside>
        <div className={styles.content}>
          <MatrixLegend labels={labels} />
          {emptyMessage ? (
            <div className={styles.empty}>
              <Text>{emptyMessage}</Text>
            </div>
          ) : (
            <MatrixTable
              plugins={filtered.plugins}
              rows={filtered.rows}
              labels={labels}
            />
          )}
        </div>
      </div>
    </Flex>
  );
};
