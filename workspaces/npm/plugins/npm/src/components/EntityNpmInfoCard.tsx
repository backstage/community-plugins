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
import { ErrorPanel, InfoCard, Link } from '@backstage/core-components';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';

import { NpmAnnotation } from '@backstage-community/plugin-npm-common';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid, { GridSize } from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { usePackageInfo } from '../hooks/usePackageInfo';
import { useTranslation } from '../hooks/useTranslation';
import { RelativePublishedAt } from './RelativePublishedAt';

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

function GridItem({
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

/**
 * Card for the catalog (entity page) that shows the npm
 * name, description, keywords, license, some links and
 * the latest version if available.
 *
 * @public
 */
export const EntityNpmInfoCard = () => {
  const { entity } = useEntity();
  const { packageInfo, loading, error } = usePackageInfo();
  const { t } = useTranslation();

  const packageName = entity.metadata.annotations?.[NpmAnnotation.PACKAGE_NAME];

  if (!packageName) {
    return (
      <MissingAnnotationEmptyState
        annotation={NpmAnnotation.PACKAGE_NAME}
        readMoreUrl="https://backstage.io/docs/features/software-catalog/descriptor-format"
      />
    );
  }

  const latestTag =
    entity.metadata.annotations?.[NpmAnnotation.STABLE_TAG] ?? 'latest';
  const latestVersion = packageInfo?.['dist-tags']?.[latestTag];
  const latestPublishedAt = latestVersion
    ? packageInfo?.time?.[latestVersion]
    : undefined;

  const registryName =
    entity.metadata.annotations?.[NpmAnnotation.REGISTRY_NAME];

  const npmLink =
    packageInfo && !registryName
      ? `https://www.npmjs.com/package/${packageName}`
      : null;

  let repositoryLink: string | undefined;
  if (packageInfo?.repository?.url) {
    let url = packageInfo.repository.url;
    if (url.startsWith('git+https://')) {
      url = url.slice('git+'.length);
    }
    if (url.endsWith('.git')) {
      url = url.slice(0, -'.git'.length);
    }
    if (url.startsWith('https://')) {
      if (
        url.startsWith('https://github.com/') &&
        packageInfo.repository.directory
      ) {
        repositoryLink = `${url}/tree/main/${packageInfo.repository.directory}`;
      } else {
        repositoryLink = url;
      }
    }
  }

  const bugsLink = packageInfo?.bugs?.url;

  const homepageLink = packageInfo?.homepage;

  return (
    <InfoCard title={t('infoCard.title', { packageName })}>
      <Grid container>
        {error ? (
          <Box sx={{ width: '100%' }}>
            <ErrorPanel error={error} />
          </Box>
        ) : null}

        {loading && !packageInfo ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              minHeight: '15rem',
            }}
          >
            <CircularProgress size="5rem" />
          </Box>
        ) : null}

        {latestVersion ? (
          <GridItem
            label={t('infoCard.latestVersion')}
            value={latestVersion}
            md={4}
          />
        ) : null}

        {latestPublishedAt ? (
          <GridItem
            label={t('infoCard.publishedAt')}
            value={<RelativePublishedAt dateTime={latestPublishedAt} />}
            md={4}
          />
        ) : null}

        {packageInfo?.license ? (
          <GridItem
            label={t('infoCard.license')}
            value={packageInfo.license}
            md={4}
          />
        ) : null}

        {/* Markdown? */}
        {packageInfo?.description ? (
          <GridItem
            label={t('infoCard.description')}
            value={packageInfo.description}
          />
        ) : null}

        {/* Markdown? */}
        {packageInfo?.keywords?.length ? (
          <GridItem
            label={t('infoCard.keywords')}
            value={packageInfo.keywords.join(', ')}
          />
        ) : null}

        {registryName ? (
          <GridItem label={t('infoCard.registryName')} value={registryName} />
        ) : null}

        {npmLink ? (
          <GridItem
            label={t('infoCard.npmRepository')}
            value={
              <Link to={npmLink} externalLinkIcon>
                {npmLink}
              </Link>
            }
          />
        ) : null}

        {repositoryLink ? (
          <GridItem
            label={t('infoCard.codeRepository')}
            value={
              <Link to={repositoryLink} externalLinkIcon>
                {repositoryLink}
              </Link>
            }
          />
        ) : null}

        {bugsLink ? (
          <GridItem
            label={t('infoCard.issueTracker')}
            value={
              <Link to={bugsLink} externalLinkIcon>
                {bugsLink}
              </Link>
            }
          />
        ) : null}

        {homepageLink ? (
          <GridItem
            label={t('infoCard.homepage')}
            value={
              <Link to={homepageLink} externalLinkIcon>
                {homepageLink}
              </Link>
            }
          />
        ) : null}
      </Grid>
    </InfoCard>
  );
};
