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

import { ReactNode, useState } from 'react';
import useAsync from 'react-use/lib/useAsync';

import { Entity } from '@backstage/catalog-model';
import {
  InfoCard,
  MissingAnnotationEmptyState,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import Assessment from '@mui/icons-material/Assessment';
import ContactMail from '@mui/icons-material/ContactMail';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import MuiTooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { matomoApiRef, transformVisitByTime } from '../../api';
import { StatsCard } from './StatsCard';

const visitColumns: TableColumn[] = [
  {
    title: 'Type',
    field: 'metric',
  },
  {
    title: 'Value',
    field: 'value',
  },
];

const geoColumns: TableColumn[] = [
  {
    title: 'Country',
    field: 'label',
  },
  {
    title: 'Avg. Site Time',
    field: 'avg_time_on_site',
  },
  {
    title: 'Bounce Rate',
    field: 'bounce_rate',
  },
  {
    title: 'Actions',
    field: 'nb_actions',
  },
  {
    title: 'Actions/Visit',
    field: 'nb_actions_per_visit',
  },
  {
    title: 'Visitors',
    field: 'nb_visits',
  },
  {
    title: 'Unique Visitors',
    field: 'nb_uniq_visitors',
  },
];

const Center = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {children}
  </div>
);

const EmptyState = () => (
  <Typography variant="h1" component="div" style={{ textAlign: 'center' }}>
    N/A
  </Typography>
);

const getMatomoConfig = (entity: Entity) =>
  entity.metadata.annotations?.['matomo.io/site-id'];

export const MatomoHomePage = () => {
  const [period, setPeriod] = useState('day');
  const [range, setRange] = useState('today');
  const [lineGraphRange, setLineGraphRange] = useState('last10');

  const { entity } = useEntity();
  const config = useApi(configApiRef);
  const matomoApi = useApi(matomoApiRef);
  const matomoSiteId = getMatomoConfig(entity);

  const matomoContact = config.getOptionalString('matomo.contactUsLink');
  const matomoInstanceUrl = config.getOptionalString('matomo.frontendBaseUrl');
  const isMatomoConfigured = Boolean(matomoSiteId);

  // visitor data
  const { loading: isVisitSummaryLoading, value: visitSummary } =
    useAsync(async () => {
      if (matomoSiteId) {
        return await matomoApi.getUserVisitMetrics(matomoSiteId, period, range);
      }
      return undefined;
    }, [matomoSiteId, period, range]);

  const { loading: isVisitByTimeLoading, value: visitByTime } =
    useAsync(async () => {
      if (matomoSiteId) {
        const data = await matomoApi.getUserVisitMetrics(
          matomoSiteId,
          period,
          lineGraphRange,
        );
        return transformVisitByTime(data.reportData);
      }
      return undefined;
    }, [matomoSiteId, period, lineGraphRange]);

  const { loading: isGeoMetricsLoading, value: geoMetrics } =
    useAsync(async () => {
      if (matomoSiteId) {
        return await matomoApi.getUserGeoMetrics(matomoSiteId, period, range);
      }
      return undefined;
    }, [matomoSiteId, period, range]);

  const { loading: isDeviceMetricsLoading, value: deviceMetrics } =
    useAsync(async () => {
      if (matomoSiteId) {
        return await matomoApi.getUserDeviceMetrics(
          matomoSiteId,
          period,
          range,
        );
      }
      return undefined;
    }, [matomoSiteId, period, range]);

  const { loading: isActionMetricsLoading, value: actionMetrics } =
    useAsync(async () => {
      if (matomoSiteId) {
        return await matomoApi.getUserActionMetrics(
          matomoSiteId,
          period,
          range,
        );
      }
      return undefined;
    }, [matomoSiteId, period, range]);

  const { loading: isActionByPageUrlLoading, value: actionByPageURL } =
    useAsync(async () => {
      if (matomoSiteId) {
        return await matomoApi.getUserActionByPageURL(
          matomoSiteId,
          period,
          range,
        );
      }
      return undefined;
    }, [matomoSiteId, period, range]);

  const visitPieChart = [
    { name: 'visitors', value: visitSummary?.reportData?.nb_visits },
    {
      name: 'unique visitors',
      value: visitSummary?.reportData?.nb_uniq_visitors,
    },
  ];

  if (!isMatomoConfigured) {
    return <MissingAnnotationEmptyState annotation="matomo.io/site-id" />;
  }

  return (
    <>
      <InfoCard>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              variant="h6"
              component="div"
              style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}
            >
              Matomo Site ID: {matomoSiteId}
            </Typography>
            <Grid container spacing={2}>
              {Boolean(matomoContact) && (
                <Grid item>
                  <MuiTooltip title="Contact Us">
                    <a target="_blank" rel="noopener" href={matomoContact}>
                      <ContactMail
                        fontSize="large"
                        style={{ color: 'rgba(0, 0, 0, 0.54)' }}
                      />
                    </a>
                  </MuiTooltip>
                </Grid>
              )}
              {Boolean(matomoInstanceUrl) && (
                <Grid item>
                  <MuiTooltip title="Matomo Instance">
                    <a target="_blank" rel="noopener" href={matomoInstanceUrl}>
                      <Assessment
                        fontSize="large"
                        style={{ color: 'rgba(0, 0, 0, 0.54)' }}
                      />
                    </a>
                  </MuiTooltip>
                </Grid>
              )}
            </Grid>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="end">
            <div style={{ marginRight: '1rem' }}>
              <FormControl variant="outlined" size="small">
                <InputLabel id="period">Period</InputLabel>
                <Select
                  labelId="period"
                  label="period"
                  value={period}
                  onChange={evt => setPeriod(evt.target.value)}
                >
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                  <MenuItem value="year">Year</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div>
              <FormControl variant="outlined" size="small">
                <InputLabel id="range">Range</InputLabel>
                <Select
                  label="range"
                  labelId="range"
                  value={range}
                  onChange={evt => setRange(evt.target.value)}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="lastWeek">Last Week</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="lastYear">Last Year</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Box>
        </Box>
      </InfoCard>
      <Grid style={{ marginTop: '1rem' }} container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card style={{ height: '370px' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                Visit Summary
              </Typography>
              {(() => {
                if (isVisitByTimeLoading) {
                  return (
                    <Center>
                      <CircularProgress size={64} />
                    </Center>
                  );
                } else if (visitSummary?.reportData?.nb_visits) {
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={visitPieChart}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                        >
                          <Cell fill="#0277bd" />
                          <Cell fill="#ff8f00" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  );
                }
                return (
                  <Center>
                    <EmptyState />
                  </Center>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card style={{ height: '370px' }}>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" component="div">
                  Visits Over Time
                </Typography>
                <div>
                  <FormControl variant="outlined" size="small">
                    <InputLabel id="line-range">Range</InputLabel>
                    <Select
                      label="range"
                      labelId="line-range"
                      value={lineGraphRange}
                      onChange={evt =>
                        setLineGraphRange(evt.target.value as string)
                      }
                    >
                      <MenuItem value="last10">Last 10</MenuItem>
                      <MenuItem value="last20">Last 20</MenuItem>
                      <MenuItem value="last30">Last 30</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
              {(() => {
                if (isVisitByTimeLoading) {
                  return (
                    <Center>
                      <CircularProgress size={64} />
                    </Center>
                  );
                } else if (visitByTime) {
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={visitByTime}
                        margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
                      >
                        <Line
                          type="monotone"
                          dataKey="visitors"
                          stroke="#0277bd"
                        />
                        <Line
                          type="monotone"
                          dataKey="uniqVisitors"
                          stroke="#ff8f00"
                          name="unique visitors"
                        />
                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                        <Tooltip />
                        <Legend />
                        <XAxis dataKey="name" />
                        <YAxis />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                }
                return (
                  <Center>
                    <EmptyState />
                  </Center>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Avg Time On Site"
            subTitle={visitSummary?.reportData?.avg_time_on_site as string}
            isLoading={isVisitSummaryLoading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Bounce Rate"
            subTitle={visitSummary?.reportData?.bounce_rate as string}
            isLoading={isVisitSummaryLoading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Actions/Visit"
            subTitle={visitSummary?.reportData?.nb_actions_per_visit as number}
            isLoading={isVisitSummaryLoading}
          />
        </Grid>
        <Grid container item xs={12}>
          <Grid item xs={4}>
            <Table
              options={{ paging: false, search: false }}
              columns={visitColumns}
              title="User Action Overview"
              isLoading={isActionMetricsLoading}
              data={actionMetrics || []}
            />
          </Grid>
          <Grid container item xs={8}>
            <Grid item xs={12}>
              <Card style={{ height: '310px' }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Visit By Page URL
                  </Typography>
                  {(() => {
                    if (isActionByPageUrlLoading) {
                      return (
                        <Center>
                          <CircularProgress size={64} />
                        </Center>
                      );
                    } else if (actionByPageURL?.length) {
                      return (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart
                            data={actionByPageURL}
                            margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
                          >
                            <Line
                              type="monotone"
                              dataKey="nb_visits"
                              name="Visits"
                              stroke="#0277bd"
                            />
                            <Line
                              type="monotone"
                              dataKey="nb_hits"
                              stroke="#ff8f00"
                              name="Page Hits"
                            />
                            <CartesianGrid
                              stroke="#ccc"
                              strokeDasharray="5 5"
                            />
                            <Tooltip />
                            <Legend />
                            <XAxis dataKey="label" />
                            <YAxis />
                          </LineChart>
                        </ResponsiveContainer>
                      );
                    }
                    return (
                      <Center>
                        <EmptyState />
                      </Center>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card style={{ height: '280px' }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Time By Page URL
                  </Typography>
                  {(() => {
                    if (isActionByPageUrlLoading) {
                      return (
                        <Center>
                          <CircularProgress size={64} />
                        </Center>
                      );
                    } else if (actionByPageURL?.length) {
                      return (
                        <ResponsiveContainer width="100%" height={210}>
                          <LineChart
                            data={actionByPageURL}
                            margin={{ top: 20, right: 20, bottom: 5, left: 0 }}
                          >
                            <Line
                              type="monotone"
                              dataKey="avg_time_on_page"
                              name="Avg. Page Time(s)"
                              stroke="#0277bd"
                            />

                            <CartesianGrid
                              stroke="#ccc"
                              strokeDasharray="5 5"
                            />
                            <Tooltip />
                            <Legend />
                            <XAxis dataKey="label" />
                            <YAxis />
                          </LineChart>
                        </ResponsiveContainer>
                      );
                    }
                    return (
                      <Center>
                        <EmptyState />
                      </Center>
                    );
                  })()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Table
            options={{ paging: false, search: false }}
            columns={geoColumns}
            title="Visit Geography Overview"
            isLoading={isGeoMetricsLoading}
            data={geoMetrics?.reportData || []}
          />
        </Grid>
        <Grid item xs={12}>
          <Table
            options={{ paging: false, search: false }}
            columns={geoColumns}
            title="Visit Device Overview"
            isLoading={isDeviceMetricsLoading}
            data={deviceMetrics?.reportData || []}
          />
        </Grid>
      </Grid>
    </>
  );
};

const queryClient = new QueryClient();

export const MatomoPage = () => (
  <QueryClientProvider client={queryClient}>
    <MatomoHomePage />
  </QueryClientProvider>
);
