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

import { Link as RouterLink, useParams } from 'react-router-dom';
import { Breadcrumbs, Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { puppetDbRouteRef } from '../../routes';
import {
  Card,
  CardBody,
  Flex,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from '@backstage/ui';
import { ReportDetailsEventsTable } from './ReportDetailsEventsTable';
import { ReportDetailsLogsTable } from './ReportDetailsLogsTable';
import styles from './ReportDetailsPage.module.css';

/**
 * Component for displaying the details of a PuppetDB report.
 *
 * @public
 */
export const ReportDetailsPage = () => {
  const { hash = '' } = useParams();
  const reportsRouteLink = useRouteRef(puppetDbRouteRef);

  return (
    <Flex direction="column">
      <Breadcrumbs aria-label="breadcrumb">
        <Link component={RouterLink} to={reportsRouteLink()}>
          PuppetDB Reports
        </Link>
        <Text truncate>{hash}</Text>
      </Breadcrumbs>
      <Card className={styles.card}>
        <CardBody>
          <Tabs>
            <TabList className={styles.tabs}>
              <Tab id="events" className={styles.tab}>
                Events
              </Tab>
              <Tab id="logs" className={styles.tab}>
                Logs
              </Tab>
            </TabList>
            <TabPanel id="events">
              <Flex direction="column" className={styles.panel}>
                <ReportDetailsEventsTable hash={hash} />
              </Flex>
            </TabPanel>
            <TabPanel id="logs">
              <Flex direction="column" className={styles.panel}>
                <ReportDetailsLogsTable hash={hash} />
              </Flex>
            </TabPanel>
          </Tabs>
        </CardBody>
      </Card>
    </Flex>
  );
};
