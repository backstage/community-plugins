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
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { ServiceAnalytics } from '../ServiceAnalytics/ServiceAnalytics';
import { Box, ButtonLink, Flex, Text } from '@backstage/ui';
import {
  RiExternalLinkLine,
  RiFileTextLine,
  RiFireLine,
  RiAlertLine,
  RiAddLine,
} from '@remixicon/react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Incident } from '../types';
import { ServiceIncidentsResponse } from '../../api/types';
import { useServiceDetails } from '../serviceDetails';
import { useServiceAnalytics } from '../serviceAnalytics';
import {
  InfoCard,
  Link,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { isFireHydrantAvailable, getFireHydrantServiceName } from '../hooks';
import styles from './ServiceDetailsCard.module.css';

const ServiceAnalyticsView = ({
  serviceId,
  startDate,
  endDate,
}: {
  serviceId: string;
  startDate: DateTime;
  endDate: DateTime;
}) => {
  const {
    loading: analyticsLoading,
    value: analyticsValue = {},
    error: analyticsError,
  } = useServiceAnalytics({
    serviceId,
    startDate: startDate.toFormat('YYYY-MM-DD'),
    endDate: endDate.toFormat('YYYY-MM-DD'),
  });

  return (
    <ServiceAnalytics
      loading={analyticsLoading}
      value={analyticsValue}
      error={analyticsError}
    />
  );
};

export const ServiceDetailsCard = () => {
  const { entity } = useEntity();
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const configApi = useApi(configApiRef);

  const BASE_URL =
    configApi.getOptionalString('firehydrant.baseUrl') ||
    'https://app.firehydrant.io';

  const startDate = DateTime.now().minus({ days: 30 }).toUTC();
  const endDate = DateTime.now().toUTC();

  // The service name is provided by an annotation or a Backstage generated service name.
  // The Backstage service name in FireHydrant is a unique formatted string
  // that requires the entity's kind, name, and namespace.
  const fireHydrantServiceName = getFireHydrantServiceName(entity);

  const { loading, value, error } = useServiceDetails({
    serviceName: fireHydrantServiceName,
    lookupByName: isFireHydrantAvailable(entity),
  });

  const activeIncidents: string[] = value?.service?.active_incidents ?? [];
  const incidents: ServiceIncidentsResponse = value?.incidents ?? [];
  const serviceId: string = value?.service?.id!;

  useEffect(() => {
    if (value?.service && Object.keys(value?.service).length > 0) {
      setShowServiceDetails(true);
    }
  }, [value]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const headerText: string = showServiceDetails
    ? `There ${activeIncidents?.length === 1 ? 'is' : 'are'} ${
        activeIncidents?.length
      } active incident${activeIncidents?.length === 1 ? '' : 's'}.`
    : '';

  const serviceIncidentsLink: string = `${BASE_URL}/incidents?search={"services":[{"label":${JSON.stringify(
    value?.service?.name,
  )},"value":${JSON.stringify(value?.service?.id)}}]}`;

  return (
    <InfoCard>
      {!showServiceDetails && !loading && (
        <Flex
          align="center"
          style={{ gap: 'var(--bui-space-2)' }}
          className={styles.warning}
        >
          <RiAlertLine size={20} />
          <Text as="span">This service does not exist in FireHydrant.</Text>
        </Flex>
      )}
      {showServiceDetails && (
        <Flex align="center" justify="between" className={styles.headerRow}>
          <Text variant="title-medium">{headerText}</Text>
          <ButtonLink
            href={serviceIncidentsLink}
            target="_blank"
            variant="primary"
          >
            <RiExternalLinkLine size={16} />
            View service incidents
          </ButtonLink>
        </Flex>
      )}
      {activeIncidents && activeIncidents?.length > 0 && (
        <Box className={styles.linksContainer}>
          {incidents &&
            incidents?.slice(0, 5).map((incident: Incident, index: number) => (
              <Box key={index}>
                <Link
                  className={styles.link}
                  to={incident.incident_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {incident.name}
                </Link>
              </Box>
            ))}
        </Box>
      )}
      <Box className={styles.viewSection}>
        <Text variant="body-medium">View in FireHydrant </Text>
        <Flex
          style={{ marginTop: 'var(--bui-space-2)', gap: 'var(--bui-space-6)' }}
        >
          <ButtonLink
            href={`${BASE_URL}/incidents/new`}
            target="_blank"
            variant="secondary"
          >
            <RiAddLine size={20} />
            Declare an incident
          </ButtonLink>
          <ButtonLink
            href={`${BASE_URL}/incidents`}
            target="_blank"
            variant="secondary"
          >
            <RiFireLine size={20} />
            View all incidents
          </ButtonLink>
          {showServiceDetails && (
            <ButtonLink
              href={`${BASE_URL}/services/${value?.service?.id}`}
              target="_blank"
              variant="secondary"
            >
              <RiFileTextLine size={20} />
              View Service Details
            </ButtonLink>
          )}
        </Flex>
      </Box>
      {showServiceDetails && (
        <Box>
          <ServiceAnalyticsView
            serviceId={serviceId}
            startDate={startDate}
            endDate={endDate}
          />
        </Box>
      )}
    </InfoCard>
  );
};
