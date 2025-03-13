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
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    minWidth: '100%',
  },
  title: {
    fontWeight: 400,
  },
  bold: {
    fontWeight: 600,
  },
  button: {
    textTransform: 'none',
  },
}));

export const MissingPermissionPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <Box className={classes.container}>
      <Grid container alignItems="center" justifyContent="space-around">
        <Grid item xs={4} md={4}>
          <Stack spacing={3} alignItems="flex-start">
            <Typography variant="h3" className={classes.title}>
              Missing Permission
            </Typography>
            <Typography variant="body1">
              To view Topology, your administrator must grant you{' '}
              <Typography component="span" className={classes.bold}>
                {kubernetesClustersReadPermission.name}
              </Typography>
              {' and '}
              <Typography component="span" className={classes.bold}>
                {kubernetesResourcesReadPermission.name}
              </Typography>{' '}
              permissions.
            </Typography>
            <Button
              className={classes.button}
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
    </Box>
  );
};
