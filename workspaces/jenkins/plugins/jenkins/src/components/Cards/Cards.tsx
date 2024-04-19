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

import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles } from '@material-ui/core/styles';
import ExternalLinkIcon from '@material-ui/icons/Launch';
import { DateTime, Duration } from 'luxon';
import React from 'react';
import { JenkinsRunStatus } from '../BuildsPage/lib/Status';
import { ErrorType, useBuilds } from '../useBuilds';
import {
  InfoCard,
  InfoCardVariants,
  Link,
  StructuredMetadataTable,
  WarningPanel,
} from '@backstage/core-components';
import { Project } from '../../api/JenkinsApi';

const useStyles = makeStyles({
  externalLinkIcon: {
    fontSize: 'inherit',
    verticalAlign: 'bottom',
  },
});

const WidgetContent = ({
  loading,
  latestRun,
}: {
  loading?: boolean;
  latestRun?: Project;
  branch: string;
}) => {
  const classes = useStyles();
  if (loading || !latestRun) return <LinearProgress />;
  const displayDate = DateTime.fromMillis(
    latestRun.lastBuild.timestamp,
  ).toRelative();
  const displayDuration =
    (latestRun.lastBuild.building ? 'Running for ' : '') +
    DateTime.local()
      .minus(Duration.fromMillis(latestRun.lastBuild.duration))
      .toRelative({ locale: 'en' })
      ?.replace(' ago', '');

  return (
    <StructuredMetadataTable
      metadata={{
        status: (
          <>
            <JenkinsRunStatus status={latestRun.lastBuild.status} />
          </>
        ),
        build: latestRun.fullDisplayName,
        'latest run': displayDate,
        duration: displayDuration,
        link: (
          <Link to={latestRun.lastBuild.url}>
            See more on Jenkins{' '}
            <ExternalLinkIcon className={classes.externalLinkIcon} />
          </Link>
        ),
      }}
    />
  );
};

const JenkinsApiErrorPanel = (props: {
  message: string;
  errorType: ErrorType;
}) => {
  const { message, errorType } = props;

  let title = undefined;
  if (errorType === ErrorType.CONNECTION_ERROR) {
    title = "Can't connect to Jenkins";
  } else if (errorType === ErrorType.NOT_FOUND) {
    title = "Can't find Jenkins project";
  }

  return <WarningPanel severity="error" title={title} message={message} />;
};

export const LatestRunCard = (props: {
  branch: string;
  variant?: InfoCardVariants;
}) => {
  const { branch = 'master', variant } = props;
  const [{ projects, loading, error }] = useBuilds({ branch });
  const latestRun = projects?.[0];
  return (
    <InfoCard title={`Latest ${branch} build`} variant={variant}>
      {!error ? (
        <WidgetContent
          loading={loading}
          branch={branch}
          latestRun={latestRun}
        />
      ) : (
        <JenkinsApiErrorPanel
          message={error.message}
          errorType={error.errorType}
        />
      )}
    </InfoCard>
  );
};
