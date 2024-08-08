import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useAsync from 'react-use/esm/useAsync';
import {
  Page,
  Header,
  Content,
  TabbedLayout,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { CodeInfoCard } from '../../components/CodeInfoCard/CodeInfoCard';
import { optimizationsApiRef } from '../../apis';
import { getTimeFromNow } from '../../utils/dates';
import { YAMLCodeDataType } from '../../utils/generateYAMLCode';
import { getRecommendedValue } from '../../utils/utils';
import { RecommendationBoxPlotsRecommendationsRecommendationTerms } from '@backstage-community/plugin-redhat-resource-optimization-common';

type RecommendationTerms =
  keyof RecommendationBoxPlotsRecommendationsRecommendationTerms;
type RecommendationEngines = 'cost' | 'performance';

export const OptimizationsBreakdownPage = () => {
  const [recommendationTerm, setRecommendationTerm] =
    useState<RecommendationTerms>('shortTerm');

  // All this can be a dedicated hook, exposed by a provider 🤔... (maybe like, "useRecommendation(id)")
  // `id` must be defined (despite being typed as "string | undefined", otherwise the URL will route the user to the recommendations list)
  const { id } = useParams();
  const api = useApi(optimizationsApiRef);
  const { value, loading, error } = useAsync(async () => {
    const apiQuery = {
      path: {
        recommendationId: id!,
      },
      query: {},
    };

    const response = await api.getRecommendationById(apiQuery);
    const payload = await response.json();

    return payload;
  }, []);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const handleChange = (event: any) => {
    setRecommendationTerm(event.target.value);
  };

  const containerData = [
    {
      key: 'Last reported:',
      value: getTimeFromNow(value?.lastReported?.toString()),
    },
    { key: 'Cluster name:', value: value?.clusterAlias },
    { key: 'Project name:', value: value?.project },
    { key: 'Workload type:', value: value?.workloadType },
    { key: 'Workload name:', value: value?.workload },
  ];

  // get current configuration
  const getCurrentYAMLCodeData = () => {
    // limits values
    const cpuLimitsValue = `${value?.recommendations?.current?.limits?.cpu?.amount}${value?.recommendations?.current?.limits?.cpu?.format}`;
    const memoryLimitsValue = `${value?.recommendations?.current?.limits?.memory?.amount}${value?.recommendations?.current?.limits?.memory?.format}`;

    // requests values
    const cpuRequestsValue = `${value?.recommendations?.current?.requests?.cpu?.amount}${value?.recommendations?.current?.requests?.cpu?.format}`;
    const memoryRequestsValue = `${value?.recommendations?.current?.requests?.memory?.amount}${value?.recommendations?.current?.requests?.memory?.format}`;

    const currentYAMLCodeData: YAMLCodeDataType = {
      limits: {
        cpu: cpuLimitsValue,
        memory: memoryLimitsValue,
      },
      requests: {
        cpu: cpuRequestsValue,
        memory: memoryRequestsValue,
      },
    };

    return currentYAMLCodeData;
  };

  // get recommended configuration
  const getRecommendedYAMLCodeData = (
    duration: RecommendationTerms,
    type: RecommendationEngines,
  ) => {
    const currentValues = value?.recommendations?.current;
    const recommendedValues =
      value?.recommendations?.recommendationTerms?.[duration]
        ?.recommendationEngines?.[type]?.config;

    if (currentValues && recommendedValues) {
      const cpuLimitsValue = getRecommendedValue(
        currentValues,
        recommendedValues,
        'limits',
        'cpu',
      );
      const memoryLimitsValue = getRecommendedValue(
        currentValues,
        recommendedValues,
        'limits',
        'memory',
      );

      const cpuRequestsValue = getRecommendedValue(
        currentValues,
        recommendedValues,
        'requests',
        'cpu',
      );
      const memoryRequestsValue = getRecommendedValue(
        currentValues,
        recommendedValues,
        'requests',
        'memory',
      );

      const recommendedYAMLCodeData: YAMLCodeDataType = {
        limits: {
          cpu: cpuLimitsValue,
          memory: memoryLimitsValue,
        },
        requests: {
          cpu: cpuRequestsValue,
          memory: memoryRequestsValue,
        },
      };

      return recommendedYAMLCodeData;
    }

    return {
      limits: {
        cpu: '',
        memory: '',
      },
      requests: {
        cpu: '',
        memory: '',
      },
    };
  };

  return (
    <Page themeId="tool">
      <Header
        title="Resource Optimization"
        type="Optimizations"
        typeLink="/redhat-resource-optimization"
      />

      <Content>
        <Typography variant="h4" paragraph>
          {value?.container}
        </Typography>

        <Grid container spacing={1} xs={8}>
          {containerData.map((item, index) => (
            <Grid container item xs={9} spacing={1} key={index}>
              <Grid item xs={4}>
                <Typography variant="body1">
                  <b>{item.key}</b>
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body1">{item.value}</Typography>
              </Grid>
            </Grid>
          ))}
          <Grid container item xs={9} spacing={1}>
            <Grid item xs={6} alignContent="center">
              <Typography variant="body1">
                <b>View optimizations based on</b>
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth variant="outlined">
                <Select
                  id="dropdown"
                  value={recommendationTerm}
                  onChange={handleChange}
                >
                  <MenuItem value="shortTerm">Last 24 hrs</MenuItem>
                  <MenuItem value="mediumTerm">Last 7 days</MenuItem>
                  <MenuItem value="longTerm">Last 15 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ marginTop: 16 }}>
          <TabbedLayout>
            <TabbedLayout.Route path="/cost?" title="Cost optimizations">
              <>
                <Grid container>
                  <Grid item xs={6}>
                    <CodeInfoCard
                      cardTitle="Current configuration"
                      showCopyCodeButton={false}
                      yamlCodeData={getCurrentYAMLCodeData()}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CodeInfoCard
                      cardTitle="Recommended configuration"
                      showCopyCodeButton
                      yamlCodeData={getRecommendedYAMLCodeData(
                        recommendationTerm,
                        'cost',
                      )}
                    />
                  </Grid>
                </Grid>
              </>
            </TabbedLayout.Route>

            <TabbedLayout.Route
              path="/performance"
              title="Performance optimizations"
            >
              <Grid container>
                <Grid item xs={6}>
                  <CodeInfoCard
                    cardTitle="Current configuration"
                    showCopyCodeButton={false}
                    yamlCodeData={getCurrentYAMLCodeData()}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CodeInfoCard
                    cardTitle="Recommended configuration"
                    showCopyCodeButton
                    yamlCodeData={getRecommendedYAMLCodeData(
                      recommendationTerm,
                      'performance',
                    )}
                  />
                </Grid>
              </Grid>
            </TabbedLayout.Route>
          </TabbedLayout>
        </Box>
      </Content>
    </Page>
  );
};
