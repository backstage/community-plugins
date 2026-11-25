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
import { useSearchParams } from 'react-router-dom';

import { type Key, Tab, TabList, TabPanel, Tabs } from '@backstage/ui';

import { useTranslation } from '../hooks/useTranslation';
import { PermissionsMatrix } from './PermissionsMatrix/PermissionsMatrix';
import { RolesList } from './RolesList/RolesList';

const VIEW_PARAM = 'view';
const ROLES_VIEW = 'roles';
const PERMISSIONS_VIEW = 'permissions';

/**
 * Switches between the roles list and the read-only permissions matrix. The
 * selected view lives in the URL so it survives navigating to a role and back.
 */
export const RbacPageContent = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedView =
    searchParams.get(VIEW_PARAM) === PERMISSIONS_VIEW
      ? PERMISSIONS_VIEW
      : ROLES_VIEW;

  const handleSelectionChange = (key: Key) => {
    setSearchParams(
      params => {
        if (key === PERMISSIONS_VIEW) {
          params.set(VIEW_PARAM, PERMISSIONS_VIEW);
        } else {
          params.delete(VIEW_PARAM);
        }
        return params;
      },
      { replace: true },
    );
  };

  return (
    <Tabs selectedKey={selectedView} onSelectionChange={handleSelectionChange}>
      <TabList aria-label={t('permissionsMatrix.tabs.label')}>
        <Tab id={ROLES_VIEW}>{t('permissionsMatrix.tabs.roles')}</Tab>
        <Tab id={PERMISSIONS_VIEW}>
          {t('permissionsMatrix.tabs.permissionsByPlugin')}
        </Tab>
      </TabList>
      <TabPanel id={ROLES_VIEW}>
        <RolesList />
      </TabPanel>
      <TabPanel id={PERMISSIONS_VIEW}>
        <PermissionsMatrix />
      </TabPanel>
    </Tabs>
  );
};
