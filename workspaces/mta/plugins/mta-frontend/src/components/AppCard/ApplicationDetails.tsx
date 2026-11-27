/*
 * Copyright 2026 The Backstage Authors
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
import { InfoCard, LinkButton } from '@backstage/core-components';
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Application } from '../../api/api';
import TagList from './TagList';

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  listItemText: {
    overflowWrap: 'break-word',
  },
  chip: {
    margin: theme.spacing(1),
  },
}));

const ApplicationDetails = () => {
  const classes = useStyles();
  const entity = useEntity();
  const application = entity?.entity?.metadata
    .application as unknown as Application;
  const annotations = entity?.entity?.metadata?.annotations || {};
  const viewUrl = annotations['issues-url'] || '';

  if (!application) {
    return null;
  }

  return (
    <Grid item xs={12} md={6}>
      <InfoCard title="Advanced Details">
        <List dense>
          <ListItem className={classes.listItem}>
            <ListItemText primary="Issues" className={classes.listItemText} />
            <ListItemSecondaryAction>
              <LinkButton to={viewUrl} target="_blank">
                View Issues
              </LinkButton>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem className={classes.listItem}>
            <ListItemText
              primary="Tags"
              className={classes.listItemText}
              secondary={
                application.tags && application.tags.length > 0 ? (
                  <Grid item xs={12}>
                    <TagList tags={application.tags} />
                  </Grid>
                ) : (
                  'None'
                )
              }
            />
          </ListItem>
          <ListItem className={classes.listItem}>
            <ListItemText
              primary="Risk Level"
              secondary={application.risk || 'None'}
              className={classes.listItemText}
            />
          </ListItem>
          <ListItem className={classes.listItem}>
            <ListItemText
              primary="Effort"
              secondary={
                application.effort === 0
                  ? 'No effort calculated'
                  : application.effort
              }
              className={classes.listItemText}
            />
          </ListItem>
          {application.description && (
            <ListItem className={classes.listItem}>
              <ListItemText
                primary="Description"
                secondary={application.description}
                className={classes.listItemText}
              />
            </ListItem>
          )}
          {application.comments && (
            <ListItem className={classes.listItem}>
              <ListItemText
                primary="Comments"
                secondary={application.comments}
                className={classes.listItemText}
              />
            </ListItem>
          )}
          {application.bucket && application.bucket.id && (
            <ListItem className={classes.listItem}>
              <ListItemText
                primary="Bucket ID"
                secondary={application.bucket.id}
                className={classes.listItemText}
              />
            </ListItem>
          )}
          <ListItem className={classes.listItem}>
            <ListItemText
              primary="Binary"
              secondary={application.binary}
              className={classes.listItemText}
            />
          </ListItem>
        </List>
      </InfoCard>
    </Grid>
  );
};

export default ApplicationDetails;
