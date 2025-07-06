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
  SONARQUBE_PROJECT_KEY_ANNOTATION,
} from '@backstage-community/plugin-sonarqube-react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import useAsync from 'react-use/esm/useAsync';
import {
  EmptyState,
  InfoCard,
  InfoCardVariants,
  Progress,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  BugReportRatingCard,
  CodeSmellsRatingCard,
  CoverageRatingCard,
  DuplicationsRatingCard,
  HotspotsReviewed,
  LastAnalyzedRatingCard,
  QualityBadge,
  VulnerabilitiesRatingCard,
} from './MetricInsights';
import { DuplicationRating } from '../SonarQubeTable/types';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { sonarqubeTranslationRef } from '../../translation';

const useStyles = makeStyles(theme => ({
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
export const SonarQubeCard = (props: {
  variant?: InfoCardVariants;
  duplicationRatings?: DuplicationRating[];
  missingAnnotationReadMoreUrl?: string;
}) => {
  const { variant = 'gridItem', missingAnnotationReadMoreUrl } = props;
  const { entity } = useEntity();
  const sonarQubeApi = useApi(sonarQubeApiRef);
  const { t } = useTranslationRef(sonarqubeTranslationRef);

  const { projectKey: projectTitle, projectInstance } = useProjectInfo(entity);

  const { value: summaryFinding, loading } = useAsync(
    async () =>
      sonarQubeApi.getFindingSummary({
        componentKey: projectTitle,
        projectInstance: projectInstance,
      }),
    [sonarQubeApi, projectTitle],
  );

  const deepLink =
    !loading && summaryFinding?.metrics
      ? {
          title: t('sonarQubeCard.deepLinkTitle'),
          link: summaryFinding.projectUrl,
        }
      : undefined;

  const classes = useStyles();
  return (
    <InfoCard
      title={t('sonarQubeCard.title')}
      deepLink={deepLink}
      variant={variant}
      headerProps={{
        action: !loading && summaryFinding?.metrics && (
          <QualityBadge value={summaryFinding} />
        ),
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
          readMoreUrl={missingAnnotationReadMoreUrl}
        />
      )}

      {!loading && projectTitle && !summaryFinding?.metrics && (
        <EmptyState
          missing="info"
          title={t('sonarQubeCard.emptyState.title')}
          description={t('sonarQubeCard.emptyState.description', {
            projectTitle,
          })}
        />
      )}

      {!loading && summaryFinding?.metrics && (
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
              <BugReportRatingCard
                value={summaryFinding}
                title={t('sonarQubeCard.bugReportRatingCardTitle')}
              />
              <VulnerabilitiesRatingCard
                value={summaryFinding}
                title={t('sonarQubeCard.vulnerabilitiesRatingCardTitle')}
              />
              <CodeSmellsRatingCard
                value={summaryFinding}
                title={t('sonarQubeCard.codeSmellsRatingCardTitle')}
              />
              <HotspotsReviewed
                value={summaryFinding}
                title={t('sonarQubeCard.hotspotsReviewedTitle')}
              />
              <div style={{ width: '100%' }} />
              <CoverageRatingCard
                value={summaryFinding}
                title={t('sonarQubeCard.coverageRatingCardTitle')}
              />
              <DuplicationsRatingCard
                value={summaryFinding}
                title={t('sonarQubeCard.duplicationsRatingCard')}
              />
            </Grid>
            <Grid item className={classes.lastAnalyzed}>
              <LastAnalyzedRatingCard value={summaryFinding} />
            </Grid>
          </Grid>
        </>
      )}
    </InfoCard>
  );
};
