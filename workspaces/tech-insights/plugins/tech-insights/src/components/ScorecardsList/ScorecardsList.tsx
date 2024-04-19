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

import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import { techInsightsApiRef } from '../../api';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import Alert from '@material-ui/lab/Alert';
import { MarkdownContent } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  listItemText: {
    paddingRight: theme.spacing(0.5),
  },
}));

export const ScorecardsList = (props: { checkResults: CheckResult[] }) => {
  const { checkResults } = props;
  const classes = useStyles();
  const api = useApi(techInsightsApiRef);

  const types = [...new Set(checkResults.map(({ check }) => check.type))];
  const checkResultRenderers = api.getCheckResultRenderers(types);

  return (
    <List>
      {checkResults.map((result, index) => {
        const description = checkResultRenderers.find(
          renderer => renderer.type === result.check.type,
        )?.description;

        return (
          <ListItem key={result.check.id}>
            <ListItemText
              key={index}
              primary={result.check.name}
              secondary={
                description ? (
                  description(result)
                ) : (
                  <MarkdownContent content={result.check.description} />
                )
              }
              className={classes.listItemText}
            />
            {checkResultRenderers
              .find(({ type }) => type === result.check.type)
              ?.component(result) ?? (
              <Alert severity="error">Unknown type.</Alert>
            )}
          </ListItem>
        );
      })}
    </List>
  );
};
