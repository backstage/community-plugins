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

import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import {
  sonarQubeApiRef,
  useProjectInfo,
} from '@backstage-community/plugin-sonarqube-react';
import { SONARQUBE_PROJECT_KEY_ANNOTATION } from '@backstage-community/plugin-sonarqube-react';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import BugReport from '@material-ui/icons/BugReport';
import Lock from '@material-ui/icons/Lock';
import LockOpen from '@material-ui/icons/LockOpen';
import Security from '@material-ui/icons/Security';
import SentimentVeryDissatisfied from '@material-ui/icons/SentimentVeryDissatisfied';
import SentimentVerySatisfied from '@material-ui/icons/SentimentVerySatisfied';
import React, { useMemo } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { Percentage } from './Percentage';
import { Rating } from './Rating';
import { RatingCard } from './RatingCard';
import { Value } from './Value';
import {
  EmptyState,
  InfoCard,
  InfoCardVariants,
  Progress,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { DateTime } from 'luxon';

const useStyles = makeStyles(theme => ({
  badgeLabel: {
    color: theme.palette.common.white,
  },
  badgeError: {
    margin: 0,
    backgroundColor: theme.palette.error.main,
  },
  badgeSuccess: {
    margin: 0,
    backgroundColor: theme.palette.success.main,
  },
  badgeUnknown: {
    backgroundColor: theme.palette.grey[500],
  },
  header: {
    padding: theme.spacing(2, 2, 2, 2.5),
  },
  action: {
    margin: 0,
  },
  lastAnalyzed: {
    color: theme.palette.text.secondary,
  },
}));

/** @public */
export type DuplicationRating = {
  greaterThan: number;
  rating: '1.0' | '2.0' | '3.0' | '4.0' | '5.0';
};

const defaultDuplicationRatings: DuplicationRating[] = [
  { greaterThan: 0, rating: '1.0' },
  { greaterThan: 3, rating: '2.0' },
  { greaterThan: 5, rating: '3.0' },
  { greaterThan: 10, rating: '4.0' },
  { greaterThan: 20, rating: '5.0' },
];

/** @public */
export const SonarQubeCard = (props: {
  variant?: InfoCardVariants;
  duplicationRatings?: DuplicationRating[];
}) => {
  const {
    variant = 'gridItem',
    duplicationRatings = defaultDuplicationRatings,
  } = props;
  const { entity } = useEntity();
  const sonarQubeApi = useApi(sonarQubeApiRef);

  const { projectKey: projectTitle, projectInstance } = useProjectInfo(entity);

  const { value, loading } = useAsync(
    async () =>
      sonarQubeApi.getFindingSummary({
        componentKey: projectTitle,
        projectInstance: projectInstance,
      }),
    [sonarQubeApi, projectTitle],
  );

  const deepLink =
    !loading && value
      ? {
          title: 'View more',
          link: value.projectUrl,
        }
      : undefined;

  const classes = useStyles();
  let gateLabel = 'Not computed';
  let gateColor = classes.badgeUnknown;

  if (value?.metrics.alert_status) {
    const gatePassed = value.metrics.alert_status === 'OK';
    gateLabel = gatePassed ? 'Gate passed' : 'Gate failed';
    gateColor = gatePassed ? classes.badgeSuccess : classes.badgeError;
  }

  const qualityBadge = !loading && value && (
    <Chip
      label={gateLabel}
      classes={{ root: gateColor, label: classes.badgeLabel }}
    />
  );

  const duplicationRating = useMemo(() => {
    if (loading || !value || !value.metrics.duplicated_lines_density) {
      return '';
    }

    let rating = '';

    for (const r of duplicationRatings) {
      if (+value.metrics.duplicated_lines_density >= r.greaterThan) {
        rating = r.rating;
      }
    }

    return rating;
  }, [loading, value, duplicationRatings]);

  return (
    <InfoCard
      title="Code Quality"
      deepLink={deepLink}
      variant={variant}
      headerProps={{
        action: qualityBadge,
        classes: {
          root: classes.header,
          action: classes.action,
        },
      }}
    >
      {loading && <Progress />}

      {!loading && !projectTitle && (
        <MissingAnnotationEmptyState
          annotation={SONARQUBE_PROJECT_KEY_ANNOTATION}
        />
      )}

      {!loading && projectTitle && !value && (
        <EmptyState
          missing="info"
          title="No information to display"
          description={`There is no SonarQube project with key '${projectTitle}'.`}
        />
      )}

      {!loading && value && (
        <>
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            alignItems="center"
            style={{ height: '100%' }}
            spacing={0}
          >
            <Grid item container justifyContent="space-around">
              <RatingCard
                titleIcon={<BugReport />}
                title="Bugs"
                link={value.getIssuesUrl('BUG')}
                leftSlot={<Value value={value.metrics.bugs} />}
                rightSlot={<Rating rating={value.metrics.reliability_rating} />}
              />
              <RatingCard
                titleIcon={
                  value.metrics.vulnerabilities === '0' ? (
                    <Lock />
                  ) : (
                    <LockOpen />
                  )
                }
                title="Vulnerabilities"
                link={value.getIssuesUrl('VULNERABILITY')}
                leftSlot={<Value value={value.metrics.vulnerabilities} />}
                rightSlot={<Rating rating={value.metrics.security_rating} />}
              />
              <RatingCard
                titleIcon={
                  value.metrics.code_smells === '0' ? (
                    <SentimentVerySatisfied />
                  ) : (
                    <SentimentVeryDissatisfied />
                  )
                }
                title="Code Smells"
                link={value.getIssuesUrl('CODE_SMELL')}
                leftSlot={<Value value={value.metrics.code_smells} />}
                rightSlot={<Rating rating={value.metrics.sqale_rating} />}
              />
              {value.metrics.security_review_rating && (
                <RatingCard
                  titleIcon={<Security />}
                  title="Hotspots Reviewed"
                  link={value.getSecurityHotspotsUrl()}
                  leftSlot={
                    <Value
                      value={
                        value.metrics.security_hotspots_reviewed
                          ? `${value.metrics.security_hotspots_reviewed}%`
                          : '—'
                      }
                    />
                  }
                  rightSlot={
                    <Rating rating={value.metrics.security_review_rating} />
                  }
                />
              )}
              <div style={{ width: '100%' }} />
              <RatingCard
                link={value.getComponentMeasuresUrl('COVERAGE')}
                title="Coverage"
                leftSlot={<Percentage value={value.metrics.coverage} />}
                rightSlot={
                  <Value
                    value={
                      value.metrics.coverage !== undefined
                        ? `${value.metrics.coverage}%`
                        : '—'
                    }
                  />
                }
              />
              <RatingCard
                title="Duplications"
                link={value.getComponentMeasuresUrl('DUPLICATED_LINES_DENSITY')}
                leftSlot={<Rating rating={duplicationRating} hideValue />}
                rightSlot={
                  <Value value={`${value.metrics.duplicated_lines_density}%`} />
                }
              />
            </Grid>
            <Grid item className={classes.lastAnalyzed}>
              Last analyzed on{' '}
              {DateTime.fromISO(value.lastAnalysis).toLocaleString(
                DateTime.DATETIME_MED,
              )}
            </Grid>
          </Grid>
        </>
      )}
    </InfoCard>
  );
};
