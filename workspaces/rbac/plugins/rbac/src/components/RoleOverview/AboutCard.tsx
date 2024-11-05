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
import React from 'react';

import {
  MarkdownContent,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  makeStyles,
} from '@material-ui/core';

import { useRole } from '../../hooks/useRole';

const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)', // for pages without content header
    marginBottom: '10px',
  },
  fullHeightCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  gridItemCardContent: {
    flex: 1,
  },
  fullHeightCardContent: {
    flex: 1,
  },
  text: {
    wordBreak: 'break-word',
  },
});

type AboutCardProps = {
  roleName: string;
};

export const AboutCard = ({ roleName }: AboutCardProps) => {
  const classes = useStyles();
  const cardClass = classes.gridItemCard;
  const cardContentClass = classes.gridItemCardContent;

  const { role, roleError, loading } = useRole(roleName);
  if (loading) {
    return <Progress />;
  }

  let lastModified = role?.metadata?.lastModified;
  if (lastModified) {
    const date = new Date(lastModified);
    const time = date.toLocaleString('en-US', {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false,
      timeZone: 'UTC',
    });
    lastModified = `${date.getUTCDate()} ${date.toLocaleString('default', {
      month: 'short',
    })} ${date.getUTCFullYear()}, ${time}`;
  } else {
    lastModified = 'No information';
  }

  return (
    <Card className={cardClass}>
      <CardHeader title="About" />
      <CardContent className={cardContentClass}>
        {roleError.name ? (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={roleError?.message}
              title="Something went wrong while fetching role"
              severity="error"
            />
          </div>
        ) : (
          <Grid container>
            <AboutField label="Description" gridSizes={{ xs: 4, sm: 8, lg: 4 }}>
              <MarkdownContent
                className={classes.text}
                content={role?.metadata?.description ?? 'No description'}
              />
            </AboutField>
            <AboutField label="Modified By" gridSizes={{ xs: 4, sm: 8, lg: 4 }}>
              <MarkdownContent
                className={classes.text}
                content={role?.metadata?.modifiedBy ?? 'No information'}
              />
            </AboutField>
            <AboutField
              label="Last Modified"
              gridSizes={{ xs: 4, sm: 8, lg: 4 }}
            >
              <MarkdownContent
                className={classes.text}
                content={lastModified}
              />
            </AboutField>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
