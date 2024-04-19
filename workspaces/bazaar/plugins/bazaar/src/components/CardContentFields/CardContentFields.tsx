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
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { GridSize } from '@material-ui/core/Grid';
import { parseEntityRef } from '@backstage/catalog-model';
import { Avatar, Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { entityRouteRef } from '@backstage/plugin-catalog-react';
import { AboutField } from './AboutField';
import { StatusTag } from '../StatusTag';
import { Member, BazaarProject } from '../../types';

type Props = {
  bazaarProject: BazaarProject;
  members: Member[];
  descriptionSize: GridSize;
  membersSize: GridSize;
};

const useStyles = makeStyles(
  {
    avatar: {
      width: '19px',
      height: '19px',
      float: 'left',
      marginRight: '0.3rem',
      marginTop: '0rem',
      marginBottom: '0rem',
      alignItems: 'left',
    },
    avatarText: {
      fontSize: '8px',
      textAlign: 'left',
    },
  },
  { name: 'CardContentFields' },
);

export const CardContentFields = ({
  bazaarProject,
  members,
  descriptionSize,
  membersSize,
}: Props) => {
  const catalogEntityRoute = useRouteRef(entityRouteRef);
  const classes = useStyles();
  return (
    <div>
      <Card>
        <CardContent>
          <Grid container>
            <Grid item xs={descriptionSize}>
              <AboutField label="Description">
                {bazaarProject.description
                  .split('\n')
                  .map((str: string, i: number) => (
                    <Typography key={i} variant="body2" paragraph>
                      {str}
                    </Typography>
                  ))}
              </AboutField>
            </Grid>

            <Grid
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
              item
              xs={membersSize}
            >
              <AboutField label="Latest members">
                {members.length ? (
                  members.slice(0, 7).map((member: Member) => {
                    return (
                      <div
                        style={{
                          textAlign: 'left',
                          backgroundColor: '',
                          marginBottom: '0.3rem',
                          marginTop: '0.3rem',
                          display: 'block',
                        }}
                        key={member.userId}
                      >
                        <Avatar
                          displayName={member.userId}
                          classes={classes}
                          picture={member.picture}
                        />
                        <Link
                          target="_blank"
                          to={
                            member.userRef
                              ? `${catalogEntityRoute(
                                  parseEntityRef(member.userRef),
                                )}`
                              : `http://github.com/${member.userId}`
                          }
                        >
                          {member?.userId}
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div />
                )}
              </AboutField>
            </Grid>

            <Grid item xs={2}>
              <AboutField label="Status">
                <StatusTag status={bazaarProject.status} />
              </AboutField>
            </Grid>

            <Grid item xs={2}>
              <AboutField label="size">
                <Typography variant="body2">{bazaarProject.size}</Typography>
              </AboutField>
            </Grid>

            <Grid item xs={2}>
              <AboutField label="Start date">
                <Typography variant="body2">
                  {bazaarProject.startDate?.substring(0, 10) || ''}
                </Typography>
              </AboutField>
            </Grid>

            <Grid item xs={2}>
              <AboutField label="End date">
                <Typography variant="body2">
                  {bazaarProject.endDate?.substring(0, 10) || ''}
                </Typography>
              </AboutField>
            </Grid>

            <Grid item xs={4}>
              <AboutField label="Responsible">
                <Typography variant="body2">
                  {bazaarProject.responsible || ''}
                </Typography>
              </AboutField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};
