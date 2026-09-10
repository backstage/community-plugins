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

import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { Box } from '@backstage/ui';
import { DagTableComponent } from '../DagTableComponent';
import { StatusComponent } from '../StatusComponent';
import { VersionComponent } from '../VersionComponent';
import styles from './HomePage.module.css';

export const HomePage = () => (
  <Page themeId="tool">
    <Header title="Apache Airflow" subtitle="Workflow management platform">
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Overview">
        <SupportButton>
          See an overview of your Apache Airflow instance, and manage workflows
        </SupportButton>
      </ContentHeader>
      <Box className={styles.overviewGrid}>
        <Box className={styles.halfWidth}>
          <VersionComponent />
        </Box>
        <Box className={styles.halfWidth}>
          <StatusComponent />
        </Box>
        <Box className={styles.fullWidth}>
          <DagTableComponent />
        </Box>
      </Box>
    </Content>
  </Page>
);
