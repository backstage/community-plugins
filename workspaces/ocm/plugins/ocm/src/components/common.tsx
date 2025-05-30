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
import {
  StatusAborted,
  StatusError,
  StatusOK,
} from '@backstage/core-components';

import { Button, Grid, makeStyles, Tooltip } from '@material-ui/core';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';

import { ClusterStatus } from '@backstage-community/plugin-ocm-common';

import { versionDetails } from '../types';

const useStyles = makeStyles({
  button: {
    textTransform: 'none',
    borderRadius: 16,
    margin: '0px',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
});

export const Status = ({ status }: { status: ClusterStatus }) => {
  if (!status) {
    return <StatusAborted>Unknown</StatusAborted>;
  } else if (status.available) {
    return <StatusOK>Ready</StatusOK>;
  }
  return <StatusError>Not Ready</StatusError>;
};

export const Update = ({ data }: { data: versionDetails }) => {
  const classes = useStyles();
  return (
    <>
      {data.update.available ? (
        <Grid container direction="column" spacing={0}>
          <Grid item>{data.version}</Grid>
          <Grid item>
            <Tooltip title={`Version ${data.update.version!} available`}>
              <Button
                variant="text"
                color="primary"
                startIcon={<ArrowCircleUpIcon />}
                className={classes.button}
                href={data.update.url}
                size="small"
              >
                Upgrade available
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      ) : (
        data.version
      )}
    </>
  );
};
