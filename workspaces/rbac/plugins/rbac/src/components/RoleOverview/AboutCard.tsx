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
import {
  MarkdownContent,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';

import { useRole } from '../../hooks/useRole';

const useStyles = makeStyles({
  text: {
    wordBreak: 'break-word',
  },
});

type AboutCardProps = {
  roleName: string;
};

export const AboutCard = ({ roleName }: AboutCardProps) => {
  const classes = useStyles();
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
    lastModified = '--';
  }

  const description =
    role?.metadata?.description && role.metadata.description.length > 0
      ? role.metadata.description
      : '--';
  const modifiedBy =
    role?.metadata?.modifiedBy && role.metadata.modifiedBy.length > 0
      ? role.metadata.modifiedBy
      : '--';
  const owner =
    role?.metadata?.owner && role.metadata.owner.length > 0
      ? role.metadata.owner
      : '--';

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100% - 10px)', // for pages without content header
        marginBottom: '10px',
      }}
    >
      <CardHeader title="About" />
      <CardContent
        sx={{
          flex: 1,
        }}
      >
        {roleError.name ? (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={roleError?.message}
              title="Something went wrong while fetching role"
              severity="error"
            />
          </div>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={3} sm={6} lg={3}>
              <AboutField label="Description">
                <MarkdownContent
                  className={classes.text}
                  content={description}
                />
              </AboutField>
            </Grid>
            <Grid item xs={3} sm={6} lg={3}>
              <AboutField label="Modified By">
                <MarkdownContent
                  className={classes.text}
                  content={modifiedBy}
                />
              </AboutField>
            </Grid>
            <Grid item xs={3} sm={6} lg={3}>
              <AboutField label="Last Modified">
                <MarkdownContent
                  className={classes.text}
                  content={lastModified}
                />
              </AboutField>
            </Grid>
            <Grid item xs={3} sm={6} lg={3}>
              <AboutField label="Owner">
                <MarkdownContent className={classes.text} content={owner} />
              </AboutField>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
