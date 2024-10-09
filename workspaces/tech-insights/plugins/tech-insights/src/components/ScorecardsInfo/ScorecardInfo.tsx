/*
 * Copyright 2021 The Backstage Authors
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

import React, { ReactNode } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import Alert from '@material-ui/lab/Alert';
import { ScorecardsList } from '../ScorecardsList';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { techInsightsApiRef } from '../../api';
import { MarkdownContent } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  subheader: {
    paddingLeft: theme.spacing(0.5),
  },
  accordionHeader: {
    borderBottom: `1px solid ${theme.palette.border}`,
  },
  accordionHeaderContent: {
    margin: `${theme.spacing(2)}px 0 !important`,
  },
}));

const infoCard = (
  title: React.ReactNode,
  description: string | undefined,
  classes: ReturnType<typeof useStyles>,
  element: React.ReactElement,
  expanded: boolean,
  summary?: string,
) => (
  <Grid item xs={12}>
    <Accordion defaultExpanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        className={classes.accordionHeader}
        classes={{
          content: classes.accordionHeaderContent,
        }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5">{title}</Typography>
          </Grid>
          <Grid item>
            <Typography>{summary}</Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container>
          {description && (
            <Grid item xs={12}>
              <Typography
                className={classes.subheader}
                variant="body1"
                gutterBottom
              >
                <MarkdownContent content={description} />
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            {element}
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  </Grid>
);

export const ScorecardInfo = (props: {
  checkResults: CheckResult[];
  title: ReactNode;
  entity: Entity;
  description?: string;
  noWarning?: boolean;
  expanded?: boolean;
}) => {
  const {
    checkResults,
    title,
    entity,
    description,
    noWarning,
    expanded = true,
  } = props;
  const classes = useStyles();
  const api = useApi(techInsightsApiRef);

  if (!checkResults.length) {
    if (noWarning) {
      return infoCard(
        title,
        description,
        classes,
        <Alert severity="info">
          All checks passed, or no checks have been performed yet
        </Alert>,
        expanded,
      );
    }
    return infoCard(
      title,
      description,
      classes,
      <Alert severity="warning">No checks have any data yet.</Alert>,
      expanded,
    );
  }

  return infoCard(
    title,
    description,
    classes,
    <ScorecardsList checkResults={checkResults} entity={entity} />,
    expanded,
    `${
      checkResults.filter(checkResult => !api.isCheckResultFailed(checkResult))
        .length
    }/${checkResults.length}`,
  );
};
