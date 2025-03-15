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

import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MissingPermissionImg from '../../../imgs/MissingPermission.svg';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import {
  kubernetesClustersReadPermission,
  kubernetesResourcesReadPermission,
} from '@backstage/plugin-kubernetes-common';
import { styled } from '@mui/styles';

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

export const MissingPermissionPage = () => {
  const navigate = useNavigate();

  return (
    <StyledBox>
      <Grid container alignItems="center" justifyContent="space-around">
        <Grid item xs={4} md={4}>
          <Stack spacing={3} alignItems="flex-start">
            <Typography variant="h3" style={{ fontWeight: 400 }}>
              Missing Permission
            </Typography>
            <Typography variant="body1">
              To view Topology, your administrator must grant you{' '}
              <StyledTypography component="span">
                {kubernetesClustersReadPermission.name}
              </StyledTypography>
              {' and '}
              <StyledTypography component="span">
                {kubernetesResourcesReadPermission.name}
              </StyledTypography>{' '}
              permissions.
            </Typography>
            <Button
              style={{ textTransform: 'none' }}
              variant="outlined"
              color="primary"
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
          </Stack>
        </Grid>
        <Grid item>
          <img src={MissingPermissionImg} alt="permission icon" />
        </Grid>
      </Grid>
    </StyledBox>
  );
};
