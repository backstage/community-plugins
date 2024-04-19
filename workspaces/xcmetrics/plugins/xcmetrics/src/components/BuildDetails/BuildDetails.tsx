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

import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { BuildResponse, xcmetricsApiRef } from '../../api';
import { Progress, StructuredMetadataTable } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/esm/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { formatDuration, formatStatus, formatTime } from '../../utils';
import { StatusIcon } from '../StatusIcon';
import { Accordion } from '../Accordion';
import { BuildTimeline } from '../BuildTimeline';
import { PreformattedText } from '../PreformattedText';

const useStyles = makeStyles(theme =>
  createStyles({
    divider: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
);

interface BuildDetailsProps {
  buildData: BuildResponse;
  showId?: boolean;
}

export const BuildDetails = ({
  buildData: { build, targets, xcode },
  showId,
}: BuildDetailsProps) => {
  const classes = useStyles();
  const client = useApi(xcmetricsApiRef);
  const hostResult = useAsync(
    async () => client.getBuildHost(build.id),
    [build.id],
  );
  const errorsResult = useAsync(
    async () => client.getBuildErrors(build.id),
    [build.id],
  );
  const warningsResult = useAsync(
    async () => client.getBuildWarnings(build.id),
    [build.id],
  );
  const metadataResult = useAsync(
    async () => client.getBuildMetadata(build.id),
    [build.id],
  );

  const buildDetails = {
    project: build.projectName,
    schema: build.schema,
    category: build.category,
    userId: build.userid,
    'started at': formatTime(build.startTimestamp),
    'ended at': formatTime(build.endTimestamp),
    duration: formatDuration(build.duration),
    status: (
      <>
        <StatusIcon buildStatus={build.buildStatus} />
        {formatStatus(build.buildStatus)}
      </>
    ),
    xcode: xcode ? `${xcode.version} (${xcode.buildNumber})` : 'Unknown',
    CI: build.isCi,
  };

  return (
    <Grid container item direction="row">
      <Grid item xs={4}>
        <StructuredMetadataTable
          metadata={
            showId === false ? buildDetails : { id: build.id, ...buildDetails }
          }
        />
      </Grid>
      <Grid item xs={8}>
        <Accordion
          id="buildHost"
          heading="Host"
          secondaryHeading={build.machineName}
        >
          {hostResult.loading && <Progress />}
          {!hostResult.loading && hostResult.value && (
            <StructuredMetadataTable metadata={hostResult.value} />
          )}
        </Accordion>

        <Accordion
          id="buildErrors"
          heading="Errors"
          secondaryHeading={build.errorCount}
          disabled={build.errorCount === 0}
        >
          <div>
            {errorsResult.loading && <Progress />}
            {!errorsResult.loading &&
              errorsResult.value?.map((error, idx) => (
                <div key={error.id}>
                  <PreformattedText
                    title="Error Details"
                    text={error.detail}
                    maxChars={190}
                    expandable
                  />
                  {idx !== errorsResult.value.length - 1 && (
                    <Divider className={classes.divider} />
                  )}
                </div>
              ))}
          </div>
        </Accordion>

        <Accordion
          id="buildWarnings"
          heading="Warnings"
          secondaryHeading={build.warningCount}
          disabled={build.warningCount === 0}
        >
          <div>
            {warningsResult.loading && <Progress />}
            {!warningsResult.loading &&
              warningsResult.value?.map((warning, idx) => (
                <div key={warning.id}>
                  <PreformattedText
                    title="Warning Details"
                    text={warning.detail ?? warning.title}
                    maxChars={190}
                    expandable
                  />
                  {idx !== warningsResult.value.length - 1 && (
                    <Divider className={classes.divider} />
                  )}
                </div>
              ))}
          </div>
        </Accordion>

        <Accordion
          id="buildMetadata"
          heading="Metadata"
          disabled={!metadataResult.loading && !metadataResult.value}
        >
          {metadataResult.loading && <Progress />}
          {!metadataResult.loading && metadataResult.value && (
            <StructuredMetadataTable metadata={metadataResult.value} />
          )}
        </Accordion>

        <Accordion id="buildTimeline" heading="Timeline" unmountOnExit>
          <BuildTimeline targets={targets} />
        </Accordion>
      </Grid>
    </Grid>
  );
};

type WithRequestProps = Omit<BuildDetailsProps, 'buildData'> & {
  buildId: string;
};

export const withRequest =
  (Component: typeof BuildDetails) =>
  ({ buildId, ...props }: WithRequestProps) => {
    const client = useApi(xcmetricsApiRef);
    const {
      value: buildResponse,
      loading,
      error,
    } = useAsync(async () => client.getBuild(buildId), []);

    if (loading) {
      return <Progress />;
    }

    if (error) {
      return <Alert severity="error">{error.message}</Alert>;
    }

    if (!buildResponse) {
      return <Alert severity="error">Could not load build {buildId}</Alert>;
    }

    return <Component {...props} buildData={buildResponse} />;
  };
