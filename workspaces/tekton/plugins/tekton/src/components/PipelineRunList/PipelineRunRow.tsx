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

import {
  Box,
  Collapse,
  IconButton,
  makeStyles,
  TableCell,
  TableRow,
  Theme,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { Timestamp, Tooltip } from '@patternfly/react-core';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { TEKTON_SIGNED_ANNOTATION } from '../../consts/tekton-const';
import { OpenRowStatus, tektonGroupColor } from '../../types/types';
import { pipelineRunDuration } from '../../utils/tekton-utils';
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

const useStyles = makeStyles((theme: Theme) => ({
  plrRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}`,
    },
  },
  plrVisRow: {
    borderBottom: `1px solid ${theme.palette.grey.A100}`,
  },
  signedIndicator: {
    display: 'inline-block',
    width: theme.spacing(2.5),
    position: 'relative',
    top: theme.spacing(0.5),
  },
}));

type PipelineRunRowProps = {
  row: PipelineRunKind;
  startTime: string;
  isExpanded?: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<OpenRowStatus>>;
};

type PipelineRunNameProps = { row: PipelineRunKind };

const PipelineRunName = ({ row }: PipelineRunNameProps) => {
  const classes = useStyles();
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
                <div
                  className={classNames(
                    classes.signedIndicator,
                    'signed-indicator',
                  )}
                >
                  <SignedBadgeIcon />
                </div>
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
  const classes = useStyles();
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
      <TableRow className={classes.plrRow}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={expandCollapseClickHandler}
          >
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">
          <PipelineRunName row={row} />
        </TableCell>
        <TableCell align="left">
          <PipelineRunVulnerabilities pipelineRun={row} condensed />
        </TableCell>
        <TableCell align="left">
          <PlrStatus obj={row} />
        </TableCell>
        <TableCell align="left">
          <PipelineRunTaskStatus pipelineRun={row} />
        </TableCell>
        <TableCell align="left">
          {startTime ? (
            <Timestamp
              className="bs-tkn-timestamp"
              date={new Date(startTime)}
            />
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell align="left">{pipelineRunDuration(row, t)}</TableCell>
        <TableCell align="left">
          <PipelineRunRowActions pipelineRun={row} />
        </TableCell>
      </TableRow>
      <TableRow className={classes.plrVisRow}>
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
