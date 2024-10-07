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
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Grid, { GridSize } from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/esm/useAsync';
import { DateTime } from 'luxon';
import { NPM_PACKAGE_ANNOTATION } from '../annotations';
import { API } from '../api';

// From https://github.com/backstage/backstage/blob/master/plugins/catalog/src/components/AboutCard/AboutField.tsx
const useStyles = makeStyles(theme => ({
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  value: {
    fontWeight: 'bold',
    overflow: 'hidden',
    lineHeight: '24px',
    wordBreak: 'break-word',
  },
}));

function Item({
  label,
  value,
  md = 12,
}: {
  label: string;
  value: React.ReactNode;
  md?: boolean | GridSize;
}) {
  const classes = useStyles();
  return (
    <Grid item md={md}>
      <Typography variant="h2" className={classes.label}>
        {label}
      </Typography>
      <Typography variant="body2" className={classes.value}>
        {value}
      </Typography>
    </Grid>
  );
}

export function NpmInfoCard() {
  const { entity } = useEntity();

  const packageName = entity.metadata.annotations?.[NPM_PACKAGE_ANNOTATION];

  const packageInfo = useAsync(
    () => API.fetchNpmPackage(packageName),
    [packageName],
  );

  if (!packageName) {
    return (
      <MissingAnnotationEmptyState
        annotation={NPM_PACKAGE_ANNOTATION}
        readMoreUrl="https://backstage.io/docs/features/software-catalog/descriptor-format"
      />
    );
  }

  const latestVersion = packageInfo.value?.['dist-tags']?.latest;
  const latestPublishedAt = latestVersion
    ? packageInfo.value?.time?.[latestVersion]
    : undefined;

  const npmLink = `https://www.npmjs.com/package/${packageName}`;

  let repositoryLink: string | undefined;
  if (packageInfo.value?.repository?.url?.startsWith('https://')) {
    repositoryLink = packageInfo.value?.repository?.url;
    if (
      repositoryLink.startsWith('https://github.com/') &&
      packageInfo.value.repository.directory
    ) {
      repositoryLink = `${repositoryLink}/tree/main/${packageInfo.value.repository.directory}`;
    }
  }

  return (
    <Card>
      <CardHeader title={`Npm package ${packageName}`} />
      <Divider />
      <CardContent>
        <Grid container>
          {latestVersion ? (
            <Item label="Latest version" value={latestVersion} md={4} />
          ) : null}

          {latestPublishedAt ? (
            <Item
              label="Published at"
              value={
                <time dateTime={latestPublishedAt} title={latestPublishedAt}>
                  {DateTime.fromISO(latestPublishedAt).toRelative()}
                </time>
              }
              md={4}
            />
          ) : null}

          {packageInfo.value?.license ? (
            <Item label="License" value={packageInfo.value.license} md={4} />
          ) : null}

          {/* Markdown? */}
          {packageInfo.value?.description ? (
            <Item label="Description" value={packageInfo.value.description} />
          ) : null}

          {/* Markdown? */}
          {packageInfo.value?.keywords?.length ? (
            <Item
              label="Keywords"
              value={packageInfo.value.keywords.join(', ')}
            />
          ) : null}

          {npmLink ? (
            <Item
              label="Npm repository"
              value={<Link href={npmLink}>{npmLink}</Link>}
            />
          ) : null}

          {repositoryLink ? (
            <Item
              label="Code repository"
              value={<Link href={repositoryLink}>{repositoryLink}</Link>}
            />
          ) : null}
        </Grid>
      </CardContent>
    </Card>
  );
}
