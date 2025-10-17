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
import { FocusEvent, useState } from 'react';

import { configApiRef, useAnalytics, useApi } from '@backstage/core-plugin-api';

import BugReportOutlined from '@mui/icons-material/BugReportOutlined';
import BugReportTwoToneIcon from '@mui/icons-material/BugReportTwoTone';
import CloseRounded from '@mui/icons-material/CloseRounded';
import SmsOutlined from '@mui/icons-material/SmsOutlined';
import SmsTwoTone from '@mui/icons-material/SmsTwoTone';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { styled, Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Dialog from '@mui/material/Dialog';
import { feedbackApiRef } from '../../api';
import { FeedbackCategory } from '../../models/feedback.model';

const PREFIX = 'CreateFeedbackModal';

const classes = {
  root: `${PREFIX}-root`,
  actions: `${PREFIX}-actions`,
  container: `${PREFIX}-container`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  closeButton: `${PREFIX}-closeButton`,
  radioGroup: `${PREFIX}-radioGroup`,
};

const StyledPaper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  [`& .${classes.root}`]: {
    '& > * > *': {
      margin: theme.spacing(1),
      width: '100%',
    },
    padding: '0.5rem',
  },

  [`& .${classes.actions}`]: {
    '& > *': {
      margin: theme.spacing(1),
    },
    paddingRight: '1rem',
  },

  [`& .${classes.container}`]: {
    padding: '1rem',
  },

  [`& .${classes.dialogTitle}`]: {},

  [`& .${classes.closeButton}`]: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },

  [`& .${classes.radioGroup}`]: {
    gap: theme.spacing(3),
  },
}));

export const CreateFeedbackModal = (props: {
  projectEntity: string;
  configType?: string;
  open: boolean;
  handleModalCloseFn: (respObj?: any) => void;
}) => {
  const feedbackApi = useApi(feedbackApiRef);
  const issueTags = feedbackApi.getErrorList();
  const feedbackTags = feedbackApi.getExperienceList();
  const analytics = useAnalytics();
  const bugsEnabled = issueTags.length === 0 ? false : true;
  const feedbackEnabled = feedbackTags.length === 0 ? false : true;
  const defaultType = bugsEnabled ? 'BUG' : 'FEEDBACK';
  const defaultTag = bugsEnabled ? issueTags[0] : feedbackTags[0];
  const [feedbackType, setFeedbackType] = useState(defaultType);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [selectedTag, setSelectedTag] = useState(defaultTag);
  const app = useApi(configApiRef);
  const summaryLimit = app.getOptionalNumber('feedback.summaryLimit') ?? 240;

  const [summary, setSummary] = useState({
    value: '',
    error: false,
    errorMessage: 'Enter some summary',
  });
  const [description, setDescription] = useState({
    value: '',
    error: false,
    errorMessage: 'Enter some description',
  });

  const projectEntity = props.projectEntity;
  const configType = (props.configType ?? 'MAIL').toLocaleLowerCase('en-US');

  function handleCategoryClick(event: any) {
    setFeedbackType(event.target.value);
    setSelectedTag(
      event.target.value === 'FEEDBACK' ? feedbackTags[0] : issueTags[0],
    );
  }

  function handleChipSlection(tag: string) {
    if (tag === selectedTag) {
      return;
    }
    setSelectedTag(tag);
  }

  function resetFields() {
    setSummary(s => ({ ...s, value: '', error: false }));
    setDescription(d => ({ ...d, value: '', error: false }));
    setSubmitClicked(false);
    setFeedbackType(defaultType);
    setSelectedTag(defaultTag);
  }

  async function handleSubmitClick() {
    setSubmitClicked(true);
    const resp = await feedbackApi.createFeedback({
      summary: summary.value,
      description: description.value,
      projectId: projectEntity,
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      feedbackType:
        feedbackType === 'BUG'
          ? FeedbackCategory.BUG
          : FeedbackCategory.FEEDBACK,
      tag: selectedTag,
    });
    props.handleModalCloseFn(resp);
    analytics.captureEvent('click', `submit - ${summary.value}`);
    resetFields();
  }

  function handleInputChange(
    event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) {
    if (event.target.id === 'summary') {
      const _summary = event.target.value;
      if (_summary.trim().length === 0) {
        return setSummary({
          ...summary,
          value: '',
          errorMessage: 'Provide summary',
          error: true,
        });
      } else if (_summary.length > summaryLimit) {
        return setSummary({
          ...summary,
          value: _summary,
          error: true,
          errorMessage: `Summary should be less than ${summaryLimit} characters.`,
        });
      }
      return setSummary({ ...summary, value: _summary, error: false });
    }
    if (event.target.id === 'description') {
      return setDescription({
        ...description,
        value: event.target.value,
        error: false,
      });
    }
    return 0;
  }

  function handleValidation(
    event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) {
    if (event.target.id === 'summary') {
      if (event.target.value.length === 0) {
        return setSummary({ ...summary, error: true });
      }
      return setSummary({
        ...summary,
        value: event.target.value.trim(),
        error: event.target.value.trim().length > summaryLimit,
      });
    }
    if (event.target.id === 'description' && event.target.value.length > 0) {
      setDescription({ ...description, value: description.value.trim() });
    }
    return 0;
  }

  return (
    <Dialog
      open={props.open}
      sx={{ position: 'fixed', right: 16, bottom: 30 }}
      onClose={() => props.handleModalCloseFn(false)}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      maxWidth="md"
    >
      <StyledPaper>
        <DialogTitle>
          {`Feedback for ${projectEntity.split('/').pop()}`}
          {props.handleModalCloseFn ? (
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={props.handleModalCloseFn}
              size="large"
            >
              <CloseRounded />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container justifyContent="flex-start" className={classes.root}>
            {configType !== 'mail' &&
            !selectedTag.match(/(Excellent|Good)/g) ? (
              <Grid xs={12}>
                <Alert severity="warning" variant="outlined">
                  Note: By submitting&nbsp;
                  {feedbackType === 'FEEDBACK' ? 'feedback' : 'bug'} with this
                  tag, it will create an issue in {configType}
                </Alert>
              </Grid>
            ) : null}
            {bugsEnabled && feedbackEnabled ? (
              <Grid item xs={4}>
                <Typography variant="h6">Select type</Typography>
                <RadioGroup className={classes.radioGroup} row>
                  <FormControlLabel
                    value="BUG"
                    checked={feedbackType === 'BUG'}
                    onChange={handleCategoryClick}
                    label="Bug"
                    control={
                      <Radio
                        icon={<BugReportOutlined />}
                        checkedIcon={<BugReportTwoToneIcon />}
                        color="error"
                      />
                    }
                  />
                  <FormControlLabel
                    value="FEEDBACK"
                    onChange={handleCategoryClick}
                    label="Feedback"
                    control={
                      <Radio
                        icon={<SmsOutlined />}
                        checkedIcon={<SmsTwoTone />}
                        color="primary"
                      />
                    }
                  />
                </RadioGroup>
              </Grid>
            ) : null}
            <Grid item xs={12}>
              <Typography variant="h6">
                Select {feedbackType === 'FEEDBACK' ? 'Feedback' : 'Bug'}
              </Typography>
              <div>
                {feedbackType === 'BUG'
                  ? issueTags.map(issueTitle => (
                      <Chip
                        key={issueTitle}
                        clickable
                        variant={
                          selectedTag === issueTitle ? 'filled' : 'outlined'
                        }
                        color="error"
                        onClick={() => handleChipSlection(issueTitle)}
                        label={issueTitle}
                      />
                    ))
                  : feedbackTags.map(feedbackTitle => (
                      <Chip
                        key={feedbackTitle}
                        clickable
                        variant={
                          selectedTag === feedbackTitle ? 'filled' : 'outlined'
                        }
                        color="primary"
                        onClick={() => handleChipSlection(feedbackTitle)}
                        label={feedbackTitle}
                      />
                    ))}
              </div>
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete="off"
                id="summary"
                label="Summary"
                value={summary.value}
                variant="outlined"
                placeholder="Enter Summary"
                onChange={handleInputChange}
                onBlur={handleValidation}
                error={summary.error}
                helperText={
                  summary.error
                    ? summary.errorMessage
                    : `${summary.value.length}/${summaryLimit}`
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                inputMode="text"
                autoComplete="off"
                id="description"
                label="Description"
                value={description.value}
                variant="outlined"
                placeholder="Enter description"
                multiline
                minRows={6}
                maxRows={10}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={props.handleModalCloseFn}>Cancel</Button>
          <Button
            onClick={handleSubmitClick}
            color="primary"
            variant="contained"
            disabled={
              summary.error || summary.value.length === 0 || submitClicked
            }
          >
            {feedbackType === 'FEEDBACK' ? 'Send Feedback' : 'Report Bug'}
          </Button>
        </DialogActions>
      </StyledPaper>
    </Dialog>
  );
};
