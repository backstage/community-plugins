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
  MatrixPluginGroup,
  MatrixRow,
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
  const [pluginFilter, setPluginFilter] = useState<string>(ALL_PLUGINS);

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

  const filtered = useMemo(
    () =>
      matrix &&
      filterPermissionsMatrix(
        matrix,
        {
          roleSearch: deferredRoleSearch,
          pluginId: pluginFilter === ALL_PLUGINS ? undefined : pluginFilter,
        },
        locale,
      ),
    [matrix, deferredRoleSearch, pluginFilter, locale],
  );

  const handlePluginChange = (value: Key | Key[] | null) => {
    const next = Array.isArray(value) ? value[0] : value;
    setPluginFilter(next ? String(next) : ALL_PLUGINS);
  };

  if (error) {
    return (
      <WarningPanel
        severity="error"
        title={error.title}
        message={error.message}
      />
    );
  }
  if (loading || !filtered) {
    return <Progress />;
  }

  const emptyMessage =
    (!filtered.plugins.length && t('permissionsMatrix.emptyPermissions')) ||
    (!filtered.rows.length && t('permissionsMatrix.emptyRoles'));

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
      <div className={styles.filters}>
        <SearchField
          aria-label={t('permissionsMatrix.filterRoles')}
          placeholder={t('permissionsMatrix.filterRoles')}
          value={roleSearch}
          onChange={setRoleSearch}
        />
        <Select
          label={t('permissionsMatrix.plugin')}
          options={pluginOptions}
          value={pluginFilter}
          onChange={handlePluginChange}
        />
      </div>
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
    </Flex>
  );
};
