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
import { blackduckApiRef } from '../../api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  InfoCard,
  TabbedCard,
  CardTab,
  Progress,
  EmptyState,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  getProjectAnnotation,
  isBlackDuckAvailable,
} from '../../utils/commonUtil';
import { BLACKDUCK_PROJECT_ANNOTATION } from '@backstage-community/plugin-blackduck-common';
import { filteredRiskProfile } from '../../utils/commonUtil';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const options = {
  indexAxis: 'y' as const,
  elements: {
    bar: {
      borderWidth: 1,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
      text: 'Risk Profile',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        display: false,
      },
    },
  },
};

const labels = ['Critical', 'High', 'Medium', 'Low'];

type CardContentProps = {
  hostKey: string;
  projectName: string;
  projectVersion: string;
};

const CardContent = ({
  hostKey,
  projectName,
  projectVersion,
}: CardContentProps) => {
  const blackduckApi = useApi(blackduckApiRef);
  const { entity } = useEntity();
  const entityRef = stringifyEntityRef(entity);
  const { value, loading, error } = useAsync(async () => {
    const data: any = await blackduckApi.getRiskProfile(
      hostKey,
      projectName,
      projectVersion,
      entityRef,
    );
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (!value) {
    return (
      <InfoCard title="BlackDuck">
        <EmptyState
          missing="info"
          title="No information to display"
          description={`There is no BlackDuck Project ${projectName} with version ${projectVersion} on host ${hostKey} available!`}
        />
      </InfoCard>
    );
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const vulnerabilityData = Object.values(
    filteredRiskProfile(value.categories.VULNERABILITY),
  );
  const operationalData = Object.values(
    filteredRiskProfile(value.categories.OPERATIONAL),
  );
  const licenseData = Object.values(
    filteredRiskProfile(value.categories.LICENSE),
  );

  const dataSec = {
    labels,
    datasets: [
      {
        data: vulnerabilityData,
        borderColor: ['#5a100c', '#9c251f', '#e78c87', '#999999'],
        backgroundColor: ['#5a100c', '#9c251f', '#e78c87', '#999999'],
      },
    ],
  };

  const dataOps = {
    labels,
    datasets: [
      {
        data: operationalData,
        borderColor: ['#5a100c', '#9c251f', '#e78c87', '#999999'],
        backgroundColor: ['#5a100c', '#9c251f', '#e78c87', '#999999'],
      },
    ],
  };

  const dataLis = {
    labels,
    datasets: [
      {
        data: licenseData,
        borderColor: ['#5a100c', '#9c251f', '#e78c87', '#999999'],
        backgroundColor: ['#5a100c', '#9c251f', '#e78c87', '#999999'],
      },
    ],
  };

  return (
    <TabbedCard
      title="BlackDuck Risk Profile"
      deepLink={{
        link: `${value._meta.href.replace('risk-profile', 'components')}`,
        title: 'View Details',
      }}
    >
      <CardTab label="Security Risk">
        <Bar options={options} data={dataSec} />
      </CardTab>
      <CardTab label="Operational Risk">
        <Bar options={options} data={dataOps} />
      </CardTab>
      <CardTab label="License Risk">
        <Bar options={options} data={dataLis} />
      </CardTab>
    </TabbedCard>
  );
};

export const RiskCardComponent = () => {
  const { entity } = useEntity();

  if (!isBlackDuckAvailable(entity)) {
    return (
      <InfoCard title="BlackDuck">
        <MissingAnnotationEmptyState
          annotation={BLACKDUCK_PROJECT_ANNOTATION}
        />
      </InfoCard>
    );
  }

  const { hostKey, projectName, projectVersion } = getProjectAnnotation(entity);

  if (!projectName || !projectVersion) {
    return (
      <InfoCard title="BlackDuck">
        <EmptyState
          missing="info"
          title="No information to display"
          description="The project annotation is not structured correctly. The project name, or project version is missing."
        />
      </InfoCard>
    );
  }

  return (
    <CardContent
      hostKey={hostKey}
      projectName={projectName}
      projectVersion={projectVersion}
    />
  );
};
