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
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { newRelicDashboardApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import {
  Progress,
  InfoCard,
  InfoCardVariants,
  Link,
  ErrorPanel,
} from '@backstage/core-components';
import DesktopMac from '@material-ui/icons/DesktopMac';
import { DashboardEntitySummary } from '../../api/NewRelicDashboardApi';
import { ResultEntity } from '../../types/DashboardEntity';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import { NEWRELIC_GUID_ANNOTATION } from '../../constants';
import { getDashboardGuids } from '../../dashboardGuids';

const useStyles = makeStyles({
  svgIcon: {
    display: 'inline-block',
    '& svg': {
      display: 'inline-block',
      fontSize: 'inherit',
      verticalAlign: 'baseline',
    },
  },
});

/** Lists the pages of the New Relic dashboard with the given GUID. */
export const DashboardPagesCard = (props: {
  guid: string;
  variant?: InfoCardVariants;
}) => {
  const { guid, variant } = props;
  const classes = useStyles();
  const newRelicDashboardAPI = useApi(newRelicDashboardApiRef);
  const { value, loading, error } = useAsync(async (): Promise<
    DashboardEntitySummary | undefined
  > => {
    const dashboardObject: Promise<DashboardEntitySummary | undefined> =
      newRelicDashboardAPI.getDashboardEntity(guid);
    return dashboardObject;
  }, [guid]);
  if (loading) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel title={error.name} defaultExpanded error={error} />;
  }
  return (
    <InfoCard title="New Relic Dashboard Pages" variant={variant}>
      {value?.getDashboardEntity === undefined &&
        'Unauthorized Request , please check API Key'}
      {value?.getDashboardEntity !== undefined &&
        value?.getDashboardEntity?.data.actor.entitySearch.results?.entities
          ?.length <= 0 && (
          <>No Dashboard Pages found with the specified Dashboard GUID</>
        )}
      {value?.getDashboardEntity?.data.actor.entitySearch.results.entities?.map(
        (entityResult: ResultEntity, index: number) => {
          return (
            <Box style={{ margin: '10px' }} display="flex" key={index}>
              <Box mr={1} className={classes.svgIcon}>
                <Typography component="div">
                  <DesktopMac />
                </Typography>
              </Box>
              <Box flexGrow="1">
                <Link to={entityResult.permalink}>{entityResult.name}</Link>
              </Box>
            </Box>
          );
        },
      )}
    </InfoCard>
  );
};

export const DashboardEntityList = () => {
  const { entity } = useEntity();
  const guids = getDashboardGuids(entity);

  if (guids.length === 0) {
    return (
      <MissingAnnotationEmptyState annotation={NEWRELIC_GUID_ANNOTATION} />
    );
  }
  if (guids.length === 1) {
    return <DashboardPagesCard guid={guids[0]} variant="gridItem" />;
  }
  return (
    <Grid container spacing={3} direction="column">
      {guids.map(guid => (
        <Grid item key={guid}>
          <DashboardPagesCard guid={guid} />
        </Grid>
      ))}
    </Grid>
  );
};
