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
import type { SetStateAction, Dispatch } from 'react';

import { useEffect, Fragment } from 'react';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Timestamp, Tooltip } from '@patternfly/react-core';

import { PipelineRunKind } from '@backstage-community/plugin-tekton-react';

import { TEKTON_SIGNED_ANNOTATION } from '../../consts/tekton-const';
import { OpenRowStatus, tektonGroupColor } from '../../types/types';
import { pipelineRunDuration } from '../../utils/tekton-utils';
import { getMergedPipelineRunTableCellSx } from './pipelineRunTableColumns';
import { PipelineRunVisualization } from '../pipeline-topology';
import PipelineRunRowActions from './PipelineRunRowActions';
import PipelineRunTaskStatus from './PipelineRunTaskStatus';
import PipelineRunVulnerabilities from './PipelineRunVulnerabilities';
import PlrStatus from './PlrStatus';
import ResourceBadge from './ResourceBadge';

import './PipelineRunRow.css';

import classNames from 'classnames';

import SignedBadgeIcon from '../Icons/SignedBadge';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

type PipelineRunRowProps = {
  row: PipelineRunKind;
  startTime: string;
  isExpanded?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<OpenRowStatus>>;
};

type PipelineRunNameProps = { row: PipelineRunKind };

const PipelineRunName = ({ row }: PipelineRunNameProps) => {
  const name = row.metadata?.name;
  const signed =
    row?.metadata?.annotations?.[TEKTON_SIGNED_ANNOTATION] === 'true';

  return (
    <div>
      {name ? (
        <ResourceBadge
          color={tektonGroupColor}
          abbr="PLR"
          name={name || ''}
          suffix={
            signed ? (
              <Tooltip content="Signed">
                <Box
                  data-testid="pipelinerun-signed"
                  className={classNames('signed-indicator')}
                  sx={{
                    display: 'inline-block',
                    width: theme => theme.spacing(2.5),
                    position: 'relative',
                    top: theme => theme.spacing(0.5),
                  }}
                >
                  <SignedBadgeIcon />
                </Box>
              </Tooltip>
            ) : null
          }
        />
      ) : (
        '-'
      )}
    </div>
  );
};

export const PipelineRunRow = ({
  row,
  startTime,
  isExpanded = false,
  open,
  setOpen,
}: PipelineRunRowProps) => {
  const uid = row.metadata?.uid;
  const { t } = useTranslationRef(tektonTranslationRef);

  useEffect(() => {
    return setOpen((val: OpenRowStatus) => {
      return {
        ...val,
        ...(uid && { [uid]: isExpanded }),
      };
    });
  }, [isExpanded, uid, setOpen]);

  const expandCollapseClickHandler = () => {
    setOpen((val: OpenRowStatus) => {
      return {
        ...val,
        ...(uid && {
          [uid]: !val[uid],
        }),
      };
    });
  };

  return (
    <Fragment key={uid}>
      <TableRow
        data-testid="pipelinerun-row"
        sx={{
          '&:nth-of-type(odd)': {
            backgroundColor: theme => theme.palette.background.paper,
          },
        }}
      >
        <TableCell
          data-testid="pipelinerun-expand-cell"
          padding="checkbox"
          sx={getMergedPipelineRunTableCellSx('expander')}
        >
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={expandCollapseClickHandler}
            role="button"
            data-testid="pipelinerun-expand-btn"
            sx={{ p: 0.5 }}
          >
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        <TableCell
          align="left"
          data-testid="pipelinerun-name-cell"
          sx={getMergedPipelineRunTableCellSx('name')}
        >
          <PipelineRunName row={row} />
        </TableCell>
        <TableCell
          align="left"
          data-testid="pipelinerun-vulnerabilities-cell"
          sx={getMergedPipelineRunTableCellSx('vulnerabilities')}
        >
          <PipelineRunVulnerabilities pipelineRun={row} condensed />
        </TableCell>
        <TableCell
          align="left"
          data-testid="pipelinerun-status-cell"
          sx={getMergedPipelineRunTableCellSx('status')}
        >
          <PlrStatus obj={row} />
        </TableCell>
        <TableCell
          align="left"
          data-testid="pipelinerun-task-status-cell"
          sx={getMergedPipelineRunTableCellSx('task-status')}
        >
          <PipelineRunTaskStatus pipelineRun={row} />
        </TableCell>
        <TableCell
          align="left"
          data-testid="pipelinerun-start-time-cell"
          sx={getMergedPipelineRunTableCellSx('start-time')}
        >
          {startTime ? (
            <Timestamp
              data-testid="pipelinerun-start-time"
              className="bs-tkn-timestamp"
              date={new Date(startTime)}
            />
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell
          align="left"
          data-testid="pipelinerun-duration-cell"
          sx={getMergedPipelineRunTableCellSx('duration')}
        >
          {pipelineRunDuration(row, t)}
        </TableCell>
        <TableCell
          align="left"
          data-testid="pipelinerun-actions-cell"
          sx={getMergedPipelineRunTableCellSx('actions')}
        >
          <PipelineRunRowActions pipelineRun={row} />
        </TableCell>
      </TableRow>
      <TableRow
        data-testid="pipelinerun-visualisation-row"
        sx={{
          borderBottom: theme => `1px solid ${theme.palette.grey.A100}`,
        }}
      >
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box marginTop={1} marginBottom={1}>
              <PipelineRunVisualization pipelineRunName={row.metadata?.name} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};
