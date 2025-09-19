/*
 * Copyright 2025 The Backstage Authors
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

/*
 * Copyright 2021 The Backstage Authors
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

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MissingPermissionImg from '../../../imgs/MissingPermission.svg';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/styles';
import type { Permission } from '@backstage/plugin-permission-common';

import { useTranslation } from '../../../hooks/useTranslation';

const StyledBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100%',
  minWidth: '100%',
}));

const StyledTypography = styled(Typography)(() => ({
  fontWeight: 600,
})) as typeof Typography;

type MissingPermissionPageProps = { permissions: Permission[] };

export const MissingPermissionPage = ({
  permissions,
}: MissingPermissionPageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const permissionNames = permissions.map(perm => perm.name).join(', ');

  const permissionText =
    permissions.length === 1
      ? t('permissions.permission')
      : t('permissions.permissions');

  return (
    <StyledBox>
      <Grid container alignItems="center" justifyContent="space-around">
        <Grid item xs={4} md={4}>
          <Stack spacing={3} alignItems="flex-start">
            <Typography variant="h3" style={{ fontWeight: 400 }}>
              {t('permissions.missingPermission')}
            </Typography>
            <Typography variant="body1">
              {(() => {
                const TOKEN = '__PERMS__';
                const sentence = t('permissions.missingPermissionDescription', {
                  permissions: TOKEN,
                  permissionText,
                });
                const [before, after] = sentence.split(TOKEN);
                return (
                  <>
                    {before}
                    <StyledTypography component="span">
                      {permissionNames}
                    </StyledTypography>
                    {after}
                  </>
                );
              })()}
            </Typography>
            <Button
              style={{ textTransform: 'none' }}
              variant="outlined"
              color="primary"
              onClick={() => navigate(-1)}
            >
              {t('permissions.goBack')}
            </Button>
          </Stack>
        </Grid>
        <Grid item>
          <img src={MissingPermissionImg} alt="" />
        </Grid>
      </Grid>
    </StyledBox>
  );
};
