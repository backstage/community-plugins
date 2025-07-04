/*
 * Copyright 2023 The Backstage Authors
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

import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Progress } from '@backstage/core-components';
import { ErrorApiError, errorApiRef, useApi } from '@backstage/core-plugin-api';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { ReactNode, useState } from 'react';
import useAsyncFn from 'react-use/esm/useAsyncFn';

import { entityFeedbackApiRef } from '../../api';

/**
 * @public
 */
export interface EntityFeedbackResponse {
  id: string;
  label: string;
}
export interface Comments {
  responseComments: {
    [key: string]: string;
  };
  additionalComments?: string;
}

const defaultFeedbackResponses: EntityFeedbackResponse[] = [
  { id: 'incorrect', label: 'Incorrect info' },
  { id: 'missing', label: 'Missing info' },
  { id: 'other', label: 'Other' },
];

/**
 * @public
 */
export interface FeedbackResponseDialogProps {
  entity: Entity;
  feedbackDialogResponses?: EntityFeedbackResponse[];
  feedbackDialogTitle?: ReactNode;
  open: boolean;
  onClose: () => void;
}

const useStyles = makeStyles<Theme>(
  theme => ({
    contactConsent: {
      marginTop: theme.spacing(1.5),
    },
    commentBoxes: {
      marginBottom: theme.spacing(1.5),
    },
    boxContainer: {
      marginBottom: theme.spacing(1.5),
      marginTop: theme.spacing(1.5),
      marginLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    formLabel: {
      marginBottom: theme.spacing(1.5),
    },
    dialogActions: {
      justifyContent: 'flex-start',
    },
  }),
  { name: 'BackstageEntityFeedbackDialog' },
);

export const FeedbackResponseDialog = (props: FeedbackResponseDialogProps) => {
  const {
    entity,
    feedbackDialogResponses = defaultFeedbackResponses,
    feedbackDialogTitle = 'Tell us what could be better',
    open,
    onClose,
  } = props;
  const classes = useStyles();
  const errorApi = useApi(errorApiRef);
  const feedbackApi = useApi(entityFeedbackApiRef);
  const [responseSelections, setResponseSelections] = useState(
    Object.fromEntries(feedbackDialogResponses.map(r => [r.id, false])),
  );
  const [comments, setComments] = useState<Comments>({
    responseComments: {},
    additionalComments: '',
  });
  const [consent, setConsent] = useState(true);

  const [{ loading: saving }, saveResponse] = useAsyncFn(async () => {
    // filter out responses that were not selected
    const filteredResponseComments = Object.entries(
      comments.responseComments,
    ).reduce((entry, [key, value]) => {
      if (responseSelections[key]) {
        entry[key] = value;
      }
      return entry;
    }, {} as { [key: string]: string });

    const filteredComments = {
      ...comments,
      responseComments: filteredResponseComments,
    };
    try {
      await feedbackApi.recordResponse(stringifyEntityRef(entity), {
        comments: JSON.stringify(filteredComments),
        consent,
        response: Object.keys(responseSelections)
          .filter(id => responseSelections[id])
          .join(','),
      });
      onClose();
    } catch (e) {
      errorApi.post(e as ErrorApiError);
    }
  }, [comments, consent, entity, feedbackApi, onClose, responseSelections]);

  return (
    <Dialog open={open} onClose={() => !saving && onClose()}>
      {saving && <Progress />}
      <DialogTitle>{feedbackDialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Select all that apply</FormLabel>
          <FormGroup className={classes.boxContainer}>
            {feedbackDialogResponses.map((response: EntityFeedbackResponse) => (
              <Grid container key={response.id} direction="column" spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={responseSelections[response.id]}
                      disabled={saving}
                      name={response.id}
                      onChange={e =>
                        setResponseSelections({
                          ...responseSelections,
                          [e.target.name]: e.target.checked,
                        })
                      }
                      color="primary"
                    />
                  }
                  label={response.label}
                />
                <Collapse in={responseSelections[response.id]}>
                  <TextField
                    data-testid={`feedback-response-dialog-collapse-comments-input-${
                      responseSelections[response.id]
                    }`}
                    disabled={saving}
                    className={classes.commentBoxes}
                    multiline
                    minRows={2}
                    fullWidth
                    variant="outlined"
                    value={comments.responseComments[response.id] || ''}
                    onChange={e =>
                      setComments(prevComments => ({
                        responseComments: {
                          ...prevComments.responseComments,
                          [response.id]: e.target.value,
                        },
                        additionalComments: prevComments.additionalComments,
                      }))
                    }
                  />
                </Collapse>
              </Grid>
            ))}
          </FormGroup>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel component="legend" className={classes.formLabel}>
            Additional comments
          </FormLabel>
          <TextField
            data-testid="feedback-response-dialog-comments-input"
            disabled={saving}
            multiline
            minRows={2}
            onChange={e =>
              setComments(prevComments => ({
                responseComments: {
                  ...prevComments.responseComments,
                },
                additionalComments: e.target.value,
              }))
            }
            variant="outlined"
            value={comments.additionalComments || ''}
          />
        </FormControl>
        <Typography className={classes.contactConsent}>
          May we contact you about your feedback?
          <Grid component="label" container alignItems="center" spacing={1}>
            <Grid item>No</Grid>
            <Grid item>
              <Switch
                checked={consent}
                disabled={saving}
                onChange={e => setConsent(e.target.checked)}
              />
            </Grid>
            <Grid item>Yes</Grid>
          </Grid>
        </Typography>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          color="primary"
          data-testid="feedback-response-dialog-submit-button"
          disabled={saving}
          onClick={saveResponse}
        >
          Submit
        </Button>
        <Button color="primary" disabled={saving} onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
