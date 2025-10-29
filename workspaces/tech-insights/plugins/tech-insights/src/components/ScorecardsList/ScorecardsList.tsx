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

import { useApi } from '@backstage/core-plugin-api';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import { CheckResult } from '@backstage-community/plugin-tech-insights-common';
import { MarkdownContent } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import {
  ResultCheckIcon,
  techInsightsApiRef,
} from '@backstage-community/plugin-tech-insights-react';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles(theme => ({
  listItemText: {
    paddingRight: theme.spacing(0.5),
  },
}));
const itemTooltip = (
  children: React.ReactElement,
  title: string | NonNullable<React.ReactNode>,
  enabled?: boolean,
) => (enabled ? <Tooltip title={title}>{children}</Tooltip> : children);

export const ScorecardsList = (props: {
  checkResults: CheckResult[];
  entity?: Entity;
  dense?: boolean;
  hideDescription?: boolean;
}) => {
  const { checkResults, entity, dense, hideDescription } = props;

  const classes = useStyles();
  const api = useApi(techInsightsApiRef);

  const types = [...new Set(checkResults.map(({ check }) => check.type))];
  const checkResultRenderers = api.getCheckResultRenderers(types);

  return (
    <List dense={dense} disablePadding>
      {checkResults.map((result, index) => {
        const checkResultRenderer = checkResultRenderers.find(
          renderer => renderer.type === result.check.type,
        );
        const renderer = checkResultRenderer?.description;
        const description = renderer ? (
          renderer(result)
        ) : (
          <MarkdownContent content={result.check.description} />
        );

        return itemTooltip(
          <ListItem key={result.check.id} disableGutters>
            <ListItemText
              key={index}
              primary={result.check.name}
              {...(!props.hideDescription
                ? {
                    secondary: description,
                  }
                : {})}
              className={classes.listItemText}
            />
            <ResultCheckIcon
              result={result}
              entity={entity}
              checkResultRenderer={checkResultRenderer}
            />
          </ListItem>,
          description,
          hideDescription,
        );
      })}
    </List>
  );
};
