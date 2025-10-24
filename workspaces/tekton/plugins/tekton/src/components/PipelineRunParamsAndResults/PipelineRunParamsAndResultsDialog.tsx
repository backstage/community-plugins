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

import { ErrorBoundary } from '@backstage/core-components';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Theme,
} from '@material-ui/core';
import CloseIcon from '@mui/icons-material/Close';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { tektonGroupColor } from '../../types/types';
import ResourceBadge from '../PipelineRunList/ResourceBadge';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations';
import { PipelineRunParamsAndResults } from './PipelineRunParamsAndResults';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }),
);

type PipelineRunParamsAndResultsDialogProps = {
  open: boolean;
  closeDialog: () => void;
  pipelineRun: PipelineRunKind;
};
export const PipelineRunParamsAndResultsDialog = ({
  open,
  closeDialog,
  pipelineRun,
}: PipelineRunParamsAndResultsDialogProps) => {
  const classes = useStyles();

  const { t } = useTranslationRef(tektonTranslationRef);

  return (
    <Dialog
      data-testid="pipelinerun-params-and-results-dialog"
      maxWidth="xl"
      fullWidth
      open={open}
      onClose={closeDialog}
    >
      <DialogTitle title={t('pipelineRunParamsAndResults.title')}>
        <Box className={classes.titleContainer}>
          <ResourceBadge
            color={tektonGroupColor}
            abbr="PLR"
            name={pipelineRun?.metadata?.name ?? ''}
          />
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={closeDialog}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <ErrorBoundary>
          <PipelineRunParamsAndResults pipelineRun={pipelineRun} />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};
