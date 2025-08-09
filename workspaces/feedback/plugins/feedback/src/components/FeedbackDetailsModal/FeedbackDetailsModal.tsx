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
import { JSX, useEffect, useState } from 'react';

import { parseEntityRef } from '@backstage/catalog-model';
import { Progress, useQueryParamState } from '@backstage/core-components';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import BugReportOutlined from '@mui/icons-material/BugReportOutlined';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import SmsOutlined from '@mui/icons-material/SmsOutlined';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { styled, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';

import { feedbackApiRef } from '../../api';
import { FeedbackType } from '../../models/feedback.model';

const PREFIX = 'FeedbackDetailsModal';

const classes = {
  closeButton: `${PREFIX}-closeButton`,
  dialogAction: `${PREFIX}-dialogAction`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  submittedBy: `${PREFIX}-submittedBy`,
  readMoreLink: `${PREFIX}-readMoreLink`,
};

const StyledDialog = styled(Dialog)(({ theme }: { theme: Theme }) => ({
  [`& .${classes.dialogAction}`]: {
    justifyContent: 'flex-start',
    paddingLeft: theme.spacing(3),
    paddingBottom: theme.spacing(2),
  },

  [`& .${classes.submittedBy}`]: {
    color: '#9e9e9e',
    fontWeight: 500,
  },

  [`& .${classes.readMoreLink}`]: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(
  ({ theme }: { theme: Theme }) => ({
    display: 'flex',
    paddingBottom: theme.spacing(0),
    marginRight: theme.spacing(2),
    '& > svg': {
      marginTop: theme.spacing(0.5),
      marginRight: theme.spacing(1),
    },
    [`& .${classes.closeButton}`]: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }),
);

export const FeedbackDetailsModal = () => {
  const api = useApi(feedbackApiRef);
  const alertApi = useApi(alertApiRef);
  const [queryState, setQueryState] = useQueryParamState<string | undefined>(
    'id',
  );
  const [modalData, setModalData] = useState<FeedbackType>();

  const [ticketDetails, setTicketDetails] = useState<{
    status: string | null;
    assignee: string | null;
    avatarUrls: {} | null;
    element: JSX.Element | null;
  }>({ status: null, assignee: null, avatarUrls: null, element: null });

  const [isLoading, setIsLoading] = useState(true);
  const [expandDescription, setExpandDescription] = useState(false);

  useEffect(() => {
    if (modalData?.ticketUrl) {
      api
        .getTicketDetails(
          modalData.feedbackId,
          modalData.ticketUrl,
          modalData.projectId,
        )
        .then(data => {
          setTicketDetails({
            status: data.status,
            assignee: data.assignee,
            avatarUrls: data.avatarUrls,
            element: (
              <>
                <ListItem>
                  <ListItemText primary="Status" />
                  <ListItemSecondaryAction>
                    <ListItemText primary={<Chip label={data.status} />} />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Assignee" />
                  <ListItemSecondaryAction>
                    <ListItemText
                      primary={
                        <Chip
                          avatar={
                            <Avatar
                              src={
                                data.avatarUrls ? data.avatarUrls['48x48'] : ''
                              }
                            />
                          }
                          label={data.assignee ? data.assignee : 'Unassigned'}
                        />
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </>
            ),
          });
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
    if (!modalData && queryState) {
      api.getFeedbackById(queryState).then(resp => {
        if (resp?.error !== undefined) {
          alertApi.post({
            message: resp.error,
            display: 'transient',
            severity: 'error',
          });
        } else {
          const respData: FeedbackType = resp?.data!;
          setModalData(respData);
        }
      });
    }
  }, [modalData, api, queryState, alertApi]);

  const handleClose = () => {
    setModalData(undefined);
    setTicketDetails({
      status: null,
      assignee: null,
      avatarUrls: null,
      element: null,
    });
    setIsLoading(true);
    setExpandDescription(false);
    setQueryState(undefined);
  };

  const getDescription = (str: string) => {
    if (!expandDescription) {
      if (str.length > 400) {
        if (str.split(' ').length > 1)
          return `${str.substring(0, str.lastIndexOf(' ', 400))}...`;
        return `${str.slice(0, 400)}...`;
      }
    }
    return str;
  };

  return (
    <StyledDialog
      open={Boolean(queryState)}
      onClose={handleClose}
      aria-labelledby="dialog-title"
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      {modalData ? (
        <>
          <StyledDialogTitle id="dialog-title">
            <Tooltip
              title={modalData.feedbackType === 'FEEDBACK' ? 'Feedback' : 'Bug'}
              arrow
              TransitionComponent={Zoom}
            >
              {modalData.feedbackType === 'FEEDBACK' ? (
                <SmsOutlined />
              ) : (
                <BugReportOutlined />
              )}
            </Tooltip>
            {modalData.summary}
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={handleClose}
              size="large"
            >
              <CloseRounded />
            </IconButton>
          </StyledDialogTitle>
          <DialogContent>
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Grid item xs={12}>
                <Typography className={classes.submittedBy} variant="body2">
                  Submitted by&nbsp;
                  <EntityRefLink entityRef={modalData.createdBy}>
                    {parseEntityRef(modalData.createdBy).name}
                  </EntityRefLink>{' '}
                  on {new Date(modalData.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                  {modalData.description
                    ? getDescription(modalData.description)
                    : 'No description provided'}
                </Typography>
                {modalData.description.length > 400 ? (
                  <Link
                    className={classes.readMoreLink}
                    onClick={() => setExpandDescription(!expandDescription)}
                  >
                    {!expandDescription ? (
                      <ExpandMoreRounded />
                    ) : (
                      <ExpandLessRounded />
                    )}
                    {!expandDescription ? 'Read More' : 'Read Less'}
                  </Link>
                ) : null}
              </Grid>
              <Grid item xs={12}>
                <List title="feedback-details-list" disablePadding>
                  <ListItem>
                    <ListItemText
                      primary={
                        modalData.feedbackType === 'FEEDBACK'
                          ? 'Feedback submitted for'
                          : 'Issue raised for'
                      }
                    />
                    <ListItemSecondaryAction>
                      <ListItemText
                        primary={
                          <EntityRefLink entityRef={modalData.projectId}>
                            <Chip
                              clickable
                              variant="outlined"
                              color="primary"
                              label={
                                modalData.projectId.split('/').slice(-1)[0]
                              }
                            />
                          </EntityRefLink>
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Tag" />
                    <ListItemSecondaryAction>
                      <ListItemText
                        primary={
                          <Chip variant="outlined" label={modalData.tag} />
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {modalData.ticketUrl ? (
                    <ListItem>
                      <ListItemText primary="Ticket Id" />
                      <ListItemSecondaryAction>
                        <ListItemText
                          primary={
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              href={modalData.ticketUrl}
                            >
                              <Chip
                                clickable
                                variant="outlined"
                                label={modalData.ticketUrl.split('/').pop()}
                              />
                            </Link>
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ) : null}
                  {isLoading ? <Progress /> : ticketDetails.element}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          {modalData.ticketUrl ? (
            <DialogActions className={classes.dialogAction}>
              <Button
                target="_blank"
                endIcon={<ArrowForwardRounded />}
                rel="noopener noreferrer"
                href={modalData.ticketUrl}
                color="primary"
              >
                View Ticket
              </Button>
            </DialogActions>
          ) : null}
        </>
      ) : null}
    </StyledDialog>
  );
};
