import React, { useEffect, useState } from 'react';

import { Progress } from '@backstage/core-components';
import {
  alertApiRef,
  configApiRef,
  identityApiRef,
  useAnalytics,
  useApi,
} from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import Add from '@mui/icons-material/Add';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import Sync from '@mui/icons-material/Sync';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import { styled, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';

import { CreateFeedbackModal } from '../CreateFeedbackModal/CreateFeedbackModal';
import { FeedbackDetailsModal } from '../FeedbackDetailsModal';
import { FeedbackTable } from '../FeedbackTable';
import { CustomEmptyState } from './CustomEmptyState';

const PREFIX = 'EntityFeedbackPage';

const classes = {
  buttonGroup: `${PREFIX}-buttonGroup`,
};

const StyledGrid = styled(Grid)(({ theme }: { theme: Theme }) => ({
  [`& .${classes.buttonGroup}`]: {
    textAlign: 'center',
    whiteSpace: 'nowrap',
    marginTop: theme.spacing(1),
  },
}));

export const EntityFeedbackPage = () => {
  const config = useApi(configApiRef);
  const alertApi = useApi(alertApiRef);

  const { entity } = useEntity();
  const user = useApi(identityApiRef);
  const analytics = useAnalytics();

  const [modalProps, setModalProps] = useState<{
    projectEntity: string;
    userEntity: string;
    serverType: string;
  }>();

  const [modalOpen, setModalOpen] = useState(false);

  const [reload, setReload] = useState(false);
  useEffect(() => {
    setReload(false);
  }, [reload]);

  const projectEntity =
    `${entity.kind}:${entity.metadata.namespace}/${entity.metadata.name}`.toLowerCase();

  const pluginConfig = {
    feedbackType: entity.metadata.annotations!['feedback/type'],
    feedbackHost:
      entity.metadata.annotations!['feedback/host'] ??
      config
        .getConfigArray('feedback.integrations.jira')[0]
        .getOptionalString('host'),
    feedbackEmailTo: entity.metadata.annotations!['feedback/email-to'],
    jiraProjectKey: entity.metadata.annotations!['jira/project-key'],
  };

  async function handleModalOpen() {
    const userEntity = (await user.getBackstageIdentity()).userEntityRef;
    analytics.captureEvent('click', 'open - create feedback modal');
    setModalProps({
      projectEntity: projectEntity,
      userEntity: userEntity,
      serverType: pluginConfig.feedbackType,
    });

    return setModalOpen(true);
  }

  const handleModalClose = (respObj: { [key: string]: string } | false) => {
    setModalOpen(false);
    analytics.captureEvent('click', 'close - feedback modal');
    if (respObj) {
      setReload(true);
      if (respObj.error) {
        alertApi.post({
          message: respObj.error,
          severity: 'error',
          display: 'transient',
        });
      } else if (respObj.message) {
        alertApi.post({
          message: respObj.message,
          severity: 'success',
          display: 'transient',
        });
      }
    }
  };

  const handleResyncClick = () => {
    analytics.captureEvent('click', 'refresh');
    setReload(true);
  };

  return pluginConfig.feedbackType === undefined ? (
    <CustomEmptyState {...pluginConfig} />
  ) : (
    <StyledGrid container justifyContent="flex-end">
      <FeedbackDetailsModal />
      <Grid item>
        <ButtonGroup
          className={classes.buttonGroup}
          color="primary"
          variant="outlined"
        >
          <Tooltip
            title="Give a feedback / Report a issue"
            arrow
            TransitionComponent={Zoom}
          >
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={handleModalOpen}
            >
              Submit Feedback
            </Button>
          </Tooltip>
          {pluginConfig.feedbackType === 'JIRA' ? (
            <Tooltip
              title="Go to Jira Project"
              arrow
              TransitionComponent={Zoom}
            >
              <Button
                endIcon={<ArrowForwardRounded />}
                href={`${pluginConfig.feedbackHost}/projects/${pluginConfig.jiraProjectKey}/summary`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Jira Project
              </Button>
            </Tooltip>
          ) : null}
          <Tooltip title="Refresh" arrow TransitionComponent={Zoom}>
            <Button onClick={handleResyncClick}>
              {!reload ? <Sync /> : <CircularProgress size="1.5rem" />}
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Grid>
      <Dialog
        open={modalOpen}
        onClose={() => handleModalClose(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        fullWidth
        maxWidth="md"
      >
        <CreateFeedbackModal
          {...modalProps!}
          handleModalCloseFn={handleModalClose}
        />
      </Dialog>
      <Grid item xs={12}>
        {reload ? <Progress /> : <FeedbackTable projectId={projectEntity} />}
      </Grid>
    </StyledGrid>
  );
};
