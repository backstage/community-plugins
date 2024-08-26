import React from 'react';
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
  projectName: string;
  projectVersion: string;
};

const CardContent = ({ projectName, projectVersion }: CardContentProps) => {
  const blackduckApi = useApi(blackduckApiRef);
  const { entity } = useEntity();
  const entityRef = stringifyEntityRef(entity);
  const { value, loading, error } = useAsync(async () => {
    const data: any = await blackduckApi.getRiskProfile(
      projectName,
      projectVersion,
      entityRef,
    );
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  } else if (!value) {
    return (
      <InfoCard title="BlackDuck">
        <EmptyState
          missing="info"
          title="No information to display"
          description={`There is no BlackDuck Project ${projectName} with version ${projectVersion} available!`}
        />
      </InfoCard>
    );
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
  const { projectName, projectVersion } = getProjectAnnotation(entity);
  return isBlackDuckAvailable(entity) ? (
    <CardContent projectName={projectName} projectVersion={projectVersion} />
  ) : (
    <MissingAnnotationEmptyState annotation={BLACKDUCK_PROJECT_ANNOTATION} />
  );
};
