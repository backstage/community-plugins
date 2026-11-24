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
import { useAsync } from 'react-use';

import { stringifyEntityRef } from '@backstage/catalog-model';
import { Link, Progress, WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { type Key, SearchField, Select, Text } from '@backstage/ui';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import {
  AccessCheckDecision,
  AccessCheckResponse,
} from '@backstage-community/plugin-rbac-common';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getConditionRuleNames,
  getShortRoleName,
  MatrixCell,
  MatrixDecision,
} from '../../utils/permissions-matrix-utils';
import { getRoleOverviewPath } from '../../utils/rbac-utils';
import {
  MatrixDecisionCell,
  useDecisionLabels,
} from '../PermissionsMatrix/MatrixDecision';
import styles from './AccessCheck.module.css';

const ALL_RESULTS = 'all';
// 'none' never appears: every permission gets an allow, deny or conditional
// answer from the policy, with deny as the default.
const RESULT_FILTERS: MatrixDecision[] = ['allow', 'deny', 'conditional'];

type UserOption = {
  ref: string;
  label: string;
};

const toDecision = (result: AuthorizeResult): MatrixDecision => {
  if (result === AuthorizeResult.ALLOW) {
    return 'allow';
  }
  if (result === AuthorizeResult.CONDITIONAL) {
    return 'conditional';
  }
  return 'deny';
};

const toCell = (decision: AccessCheckDecision): MatrixCell => {
  if (decision.result !== AuthorizeResult.CONDITIONAL) {
    return {
      decision: decision.result === AuthorizeResult.ALLOW ? 'allow' : 'deny',
    };
  }
  return {
    decision: 'conditional',
    rules: [
      ...new Set(
        decision.conditionalBy.flatMap(condition =>
          getConditionRuleNames(condition.conditions),
        ),
      ),
    ],
  };
};

/** The subjects a decision comes from: the deny vetoes when the result is a deny. */
const decisionSources = (decision: AccessCheckDecision): string[] => {
  if (decision.result === AuthorizeResult.CONDITIONAL) {
    return [...new Set(decision.conditionalBy.map(c => c.roleEntityRef))];
  }
  if (decision.deniedBy.length > 0) {
    return decision.deniedBy;
  }
  return decision.allowedBy;
};

const SourceRef = ({ subject }: { subject: string }) =>
  subject.startsWith('role:') ? (
    <Link to={getRoleOverviewPath(subject)} title={subject}>
      {getShortRoleName(subject)}
    </Link>
  ) : (
    <Text as="span">{subject}</Text>
  );

const UserPicker = ({
  onSelect,
}: {
  onSelect: (userRef: string | null) => void;
}) => {
  const { t } = useTranslation();
  const rbacApi = useApi(rbacApiRef);
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);

  const { value: options = [], loading } = useAsync(async () => {
    const result = await rbacApi.searchMembers({
      searchTerm: deferredInput,
      kind: 'user',
      limit: 20,
    });
    if (!('items' in result)) {
      return [];
    }
    return result.items.map(member => ({
      ref: stringifyEntityRef(member),
      label: member.spec?.profile?.displayName ?? member.metadata.name,
    }));
  }, [deferredInput, rbacApi]);

  return (
    <Autocomplete<UserOption>
      className={styles.userPicker}
      options={options}
      loading={loading}
      // the catalog search already narrows the options
      filterOptions={userOptions => userOptions}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={(option, value) => option.ref === value.ref}
      renderOption={(props, option) => (
        <li {...props} key={option.ref}>
          <div>
            {option.label}
            <Text as="p" variant="body-small" color="secondary">
              {option.ref}
            </Text>
          </div>
        </li>
      )}
      onInputChange={(_event, newInput) => setInput(newInput)}
      onChange={(_event, option) => onSelect(option?.ref ?? null)}
      renderInput={params => (
        <TextField
          {...params}
          label={t('accessCheck.selectUser')}
          variant="outlined"
        />
      )}
    />
  );
};

/**
 * Reduced-scope access checker: shows the decision the permission policy
 * already makes for a selected user, per plugin permission, and which role or
 * group each decision comes from. Conditional decisions are reported as
 * stored, not evaluated against a resource.
 */
export const AccessCheck = () => {
  const { t } = useTranslation();
  const locale = useLanguage();
  const rbacApi = useApi(rbacApiRef);
  const decisionLabels = useDecisionLabels();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<string>(ALL_RESULTS);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const {
    loading,
    value: check,
    error,
  } = useAsync(async (): Promise<AccessCheckResponse | undefined> => {
    if (!selectedUser) {
      return undefined;
    }
    const result = await rbacApi.checkAccess(selectedUser);
    if ('userEntityRef' in result) {
      return result;
    }
    // Prefer the backend's own error message: statusText is empty over
    // HTTP/2, and a bare status number tells the admin nothing.
    let message = result.statusText;
    try {
      const body = await result.json();
      message = body?.error?.message || message;
    } catch {
      // not a JSON body; keep the status text
    }
    throw new Error(message || String(result.status));
  }, [selectedUser, rbacApi]);

  const handleResultChange = (value: Key | Key[] | null) => {
    const next = Array.isArray(value) ? value[0] : value;
    setResultFilter(next ? String(next) : ALL_RESULTS);
  };

  const filteredDecisions = useMemo(() => {
    if (!check) {
      return [];
    }
    const term = deferredSearch.trim().toLocaleUpperCase(locale);
    return check.decisions.filter(decision => {
      if (
        resultFilter !== ALL_RESULTS &&
        toDecision(decision.result) !== resultFilter
      ) {
        return false;
      }
      if (!term) {
        return true;
      }
      return (
        decision.permission.toLocaleUpperCase(locale).includes(term) ||
        decision.pluginId.toLocaleUpperCase(locale).includes(term)
      );
    });
  }, [check, resultFilter, deferredSearch, locale]);

  return (
    <div className={styles.container}>
      <Text as="p" color="secondary">
        {t('accessCheck.description')}
      </Text>
      <div className={styles.controls}>
        <UserPicker onSelect={setSelectedUser} />
        {check && (
          <>
            <SearchField
              label={t('accessCheck.filterPermissions')}
              placeholder={t('accessCheck.filterPermissions')}
              value={search}
              onChange={setSearch}
            />
            <Select
              label={t('accessCheck.access')}
              value={resultFilter}
              onChange={handleResultChange}
              options={[
                { value: ALL_RESULTS, label: t('accessCheck.allResults') },
                ...RESULT_FILTERS.map(decision => ({
                  value: decision,
                  label: decisionLabels[decision],
                })),
              ]}
            />
          </>
        )}
      </div>

      {error && (
        <WarningPanel
          severity="error"
          title={t('accessCheck.errors.checkAccess')}
          message={error.message}
        />
      )}
      {loading && <Progress />}

      {!loading && !error && !check && (
        <Text as="p">{t('accessCheck.selectUserPrompt')}</Text>
      )}

      {!loading && !error && check && (
        <>
          {check.isSuperUser && (
            <Text as="p">{t('accessCheck.superUser')}</Text>
          )}

          <Text as="h3" variant="title-small">
            {t('accessCheck.rolesTitle')}
          </Text>
          {check.roles.length === 0 ? (
            <Text as="p">{t('accessCheck.noRoles')}</Text>
          ) : (
            <ul className={styles.roleList}>
              {check.roles.map(membership => (
                <li key={membership.roleEntityRef} className={styles.roleItem}>
                  <Link
                    to={getRoleOverviewPath(membership.roleEntityRef)}
                    title={membership.roleEntityRef}
                  >
                    {getShortRoleName(membership.roleEntityRef)}
                  </Link>
                  <Text as="span" variant="body-small" color="secondary">
                    {membership.via.length === 0
                      ? t('accessCheck.appliesToEveryUser')
                      : membership.via
                          .map(ref =>
                            ref === check.userEntityRef
                              ? t('accessCheck.directAssignment')
                              : t('accessCheck.viaGroup' as any, { ref }),
                          )
                          .join(', ')}
                  </Text>
                </li>
              ))}
            </ul>
          )}

          <Text as="h3" variant="title-small">
            {t('accessCheck.permissionsTitle')}
          </Text>
          <Text as="p" variant="body-small" color="secondary">
            {t('accessCheck.conditionalNote')}
          </Text>
          {filteredDecisions.length === 0 ? (
            <div className={styles.empty}>
              <Text as="p">{t('accessCheck.noMatches')}</Text>
            </div>
          ) : (
            <div
              className={styles.scroll}
              // the table can scroll and may hold no focusable content, so
              // the region itself must be reachable by keyboard
              role="region"
              aria-label={t('accessCheck.permissionsTitle')}
              tabIndex={0}
            >
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('accessCheck.plugin')}</th>
                    <th>{t('accessCheck.permission')}</th>
                    <th>{t('accessCheck.action')}</th>
                    <th>{t('accessCheck.access')}</th>
                    <th>{t('accessCheck.source')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDecisions.map(decision => {
                    const sources = decisionSources(decision);
                    return (
                      <tr
                        key={`${decision.pluginId}:${decision.permission}:${decision.action}`}
                      >
                        <td>{decision.pluginId}</td>
                        <td>{decision.permission}</td>
                        <td>{decision.action}</td>
                        <td>
                          <span className={styles.decisionCell}>
                            <MatrixDecisionCell
                              cell={toCell(decision)}
                              labels={decisionLabels}
                              conditionalRulesLabel={t(
                                'permissionsMatrix.conditionalRules',
                              )}
                            />
                            <Text as="span" variant="body-small">
                              {decisionLabels[toDecision(decision.result)]}
                            </Text>
                          </span>
                        </td>
                        <td>
                          {sources.length === 0 ? (
                            <Text as="span" color="secondary">
                              {check.isSuperUser
                                ? t('accessCheck.superUserSource')
                                : t('accessCheck.noMatchingPolicy')}
                            </Text>
                          ) : (
                            sources.map((subject, index) => (
                              <Text as="span" key={subject}>
                                {index > 0 && ', '}
                                <SourceRef subject={subject} />
                              </Text>
                            ))
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
