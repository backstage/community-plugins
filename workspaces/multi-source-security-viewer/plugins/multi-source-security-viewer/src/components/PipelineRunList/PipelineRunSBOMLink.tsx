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

import type { FC } from 'react';

import { useState, useMemo, Fragment } from 'react';
import { IconButton, makeStyles, Box } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { DialogLauncher } from '../DialogLauncher/DialogLauncher';
import { PipelineRunResult } from '../../models/pipelineRunResult';
import { PipelineRunLogs } from '../PipelineRunLogs/PipelineRunLogs';
import Tooltip from '@mui/material/Tooltip';
import { SBOMLinkIcon } from '../Icons/SBOMLink';

const useStyles = makeStyles(() => ({
  icon: {
    cursor: 'pointer',
    padding: 0,
  },
}));

interface PipelineRunSBOMLinkProps {
  pr: PipelineRunResult;
}

export const PipelineRunSBOMLink: FC<PipelineRunSBOMLinkProps> = ({ pr }) => {
  const classes = useStyles();
  const [openSBOMLogs, setOpenSBOMLogs] = useState(false);
  const step = useMemo(
    () =>
      pr.steps.findIndex(
        s => s.name?.trim().toLowerCase() === 'show-sbom-rhdh',
      ),
    [pr.steps],
  );

  return (
    <Fragment>
      <DialogLauncher
        key={`${pr.id}-logs`}
        title={pr.id}
        open={openSBOMLogs}
        onClose={() => setOpenSBOMLogs(false)}
        component={PipelineRunLogs}
        componentProps={{
          step,
          pr,
        }}
        fullWidth
        maxWidth="xl"
      />
      <Tooltip title="Link to SBOM" arrow placement="left">
        <Box>
          <IconButton
            className={classes.icon}
            disabled={pr.isBuild ? step === -1 : !pr.tpaLink}
            onClick={pr.isBuild ? () => setOpenSBOMLogs(true) : undefined}
          >
            {pr.isBuild ? (
              <SBOMLinkIcon disabled={step === -1} />
            ) : (
              <Link className={classes.icon} to={pr.tpaLink} target="_blank">
                <SBOMLinkIcon disabled={!pr.tpaLink} />
              </Link>
            )}
          </IconButton>
        </Box>
      </Tooltip>
    </Fragment>
  );
};
