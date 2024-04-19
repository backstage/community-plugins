/*
 * Copyright 2020 The Backstage Authors
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

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FormFactor,
  LighthouseConfigSettings,
} from '@backstage-community/plugin-lighthouse-common';
import { lighthouseApiRef } from '../../api';
import { useQuery } from '../../utils';
import LighthouseSupportButton from '../SupportButton';

import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
} from '@backstage/core-components';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';

// TODO(freben): move all of this out of index

const useStyles = makeStyles(theme => ({
  input: {
    minWidth: 300,
    [theme.breakpoints.down('xs')]: {
      minWidth: '100%',
    },
  },
  buttonList: {
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    '& > *': {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
      marginRight: 0,
      flexDirection: 'column',
      '& > *': {
        width: '100%',
      },
    },
  },
}));

const formFactorToScreenEmulationMap: Record<
  FormFactor,
  LighthouseConfigSettings['screenEmulation']
> = {
  // the default is mobile, so no need to override
  mobile: undefined,
  // Values from lighthouse's cli "desktop" preset
  // https://github.com/GoogleChrome/lighthouse/blob/a6738e0033e7e5ca308b97c1c36f298b7d399402/lighthouse-core/config/constants.js#L71-L77
  desktop: {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false,
  },
};

export const CreateAuditContent = () => {
  const errorApi = useApi(errorApiRef);
  const lighthouseApi = useApi(lighthouseApiRef);
  const classes = useStyles();
  const query = useQuery();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [url, setUrl] = useState<string>(query.get('url') || '');
  const [formFactor, setFormFactor] = useState<FormFactor>('mobile');

  const triggerAudit = useCallback(async (): Promise<void> => {
    setSubmitting(true);
    try {
      // TODO use the id from the response to redirect to the audit page for that id when
      // FAILED and RUNNING audits are supported
      await lighthouseApi.triggerAudit({
        url: url.replace(/\/$/, ''),
        options: {
          lighthouseConfig: {
            settings: {
              formFactor,
              emulatedFormFactor: formFactor,
              screenEmulation: formFactorToScreenEmulationMap[formFactor],
            },
          },
        },
      });
      navigate('..');
    } catch (err) {
      errorApi.post(err);
    } finally {
      setSubmitting(false);
    }
  }, [url, formFactor, lighthouseApi, setSubmitting, errorApi, navigate]);

  return (
    <>
      <ContentHeader
        title="Trigger a new audit"
        description="Submitting this form will immediately trigger and store a new Lighthouse audit. Trigger audits to track your website's accessibility, performance, SEO, and best practices over time."
      >
        <LighthouseSupportButton />
      </ContentHeader>
      <Grid container direction="column">
        <Grid item xs={12} sm={6}>
          <InfoCard>
            <form
              onSubmit={ev => {
                ev.preventDefault();
                triggerAudit();
              }}
            >
              <List>
                <ListItem>
                  <TextField
                    name="lighthouse-create-audit-url-tf"
                    className={classes.input}
                    label="URL"
                    placeholder="https://spotify.com"
                    helperText="The target URL for Lighthouse to use."
                    required
                    disabled={submitting}
                    onChange={ev => setUrl(ev.target.value)}
                    value={url}
                    inputProps={{ 'aria-label': 'URL' }}
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    name="lighthouse-create-audit-emulated-form-factor-tf"
                    className={classes.input}
                    label="Emulated Form Factor"
                    helperText="Device to simulate when auditing"
                    select
                    required
                    disabled={submitting}
                    onChange={ev =>
                      setFormFactor(ev.target.value as FormFactor)
                    }
                    value={formFactor}
                    inputProps={{ 'aria-label': 'Emulated form factor' }}
                  >
                    <MenuItem value="mobile">Mobile</MenuItem>
                    <MenuItem value="desktop">Desktop</MenuItem>
                  </TextField>
                </ListItem>
                <ListItem className={classes.buttonList}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('..')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting}
                  >
                    Create Audit
                  </Button>
                </ListItem>
              </List>
            </form>
          </InfoCard>
        </Grid>
      </Grid>
    </>
  );
};

const CreateAudit = () => (
  <Page themeId="tool">
    <Header title="Lighthouse" subtitle="Website audits powered by Lighthouse">
      <HeaderLabel label="Owner" value="Spotify" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <CreateAuditContent />
    </Content>
  </Page>
);

export default CreateAudit;
