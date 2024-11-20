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
import React from 'react';
import { useParams } from 'react-router-dom';

import { Header, Page, TabbedLayout } from '@backstage/core-components';

import Grid from '@mui/material/Grid';

import { useLocationToast } from '../../hooks/useLocationToast';
import { useMembers } from '../../hooks/useMembers';
import { SnackbarAlert } from '../SnackbarAlert';
import { useToast } from '../ToastContext';
import { AboutCard } from './AboutCard';
import { MembersCard } from './MembersCard';
import { PermissionsCard } from './PermissionsCard';

export const RoleOverviewPage = () => {
  const { roleName, roleNamespace, roleKind } = useParams();
  const { toastMessage, setToastMessage } = useToast();
  const membersInfo = useMembers(`${roleKind}:${roleNamespace}/${roleName}`);

  useLocationToast(setToastMessage);

  const onAlertClose = () => {
    setToastMessage('');
  };

  return (
    <>
      <SnackbarAlert toastMessage={toastMessage} onAlertClose={onAlertClose} />
      <Page themeId="tool">
        <Header
          title={`${roleKind}:${roleNamespace}/${roleName}`}
          type="RBAC"
          typeLink=".."
        />
        <TabbedLayout>
          <TabbedLayout.Route path="" title="Overview">
            <Grid container direction="row">
              <Grid item lg={12} xs={12}>
                <AboutCard
                  roleName={`${roleKind}:${roleNamespace}/${roleName}`}
                />
              </Grid>
              <Grid item lg={6} xs={12}>
                <MembersCard
                  roleName={`${roleKind}:${roleNamespace}/${roleName}`}
                  membersInfo={membersInfo}
                />
              </Grid>
              <Grid item lg={6} xs={12}>
                <PermissionsCard
                  entityReference={`${roleKind}:${roleNamespace}/${roleName}`}
                  canReadUsersAndGroups={membersInfo.canReadUsersAndGroups}
                />
              </Grid>
            </Grid>
          </TabbedLayout.Route>
        </TabbedLayout>
      </Page>
    </>
  );
};
