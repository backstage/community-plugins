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
import { Link, LinkButton } from '@backstage/core-components';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

import { useTranslation } from '../../hooks/useTranslation';
import { Trans } from '../Trans';

export const RolesListToolbar = ({
  createRoleAllowed,
  createRoleLoading,
}: {
  createRoleAllowed: boolean;
  createRoleLoading: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <div>
      {!createRoleLoading && !createRoleAllowed && (
        <Alert severity="warning" data-testid="create-role-warning">
          <AlertTitle
            sx={{
              fontWeight: 'bold',
            }}
          >
            {t('toolbar.warning.title')}
          </AlertTitle>
          <Trans
            message="toolbar.warning.message"
            params={{
              link: (
                <Link
                  to="https://github.com/backstage/community-plugins/tree/main/workspaces/rbac/plugins/rbac#prerequisites"
                  target="_blank"
                >
                  {t('toolbar.warning.linkText')}
                </Link>
              ),
            }}
          />
          <Typography sx={{ mt: 1 }} fontSize="small">
            <Typography component="span" fontWeight="bold" fontSize="small">
              {t('toolbar.warning.note')}
            </Typography>
            : {t('toolbar.warning.noteText')}
          </Typography>
        </Alert>
      )}
      <br />
      <Typography
        component="span"
        sx={{
          display: 'flex',
          justifyContent: 'end',
          marginBottom: '24px !important',
        }}
      >
        <LinkButton
          to="role/new"
          color="primary"
          variant="contained"
          disabled={!createRoleAllowed}
          data-testid="create-role"
        >
          {t('toolbar.createButton')}
        </LinkButton>
      </Typography>
    </div>
  );
};
