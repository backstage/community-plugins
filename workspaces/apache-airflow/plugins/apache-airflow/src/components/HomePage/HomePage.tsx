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

import { SupportButton } from '@backstage/core-components';
import { Container, Flex, Header, Text } from '@backstage/ui';
import Grid from '@material-ui/core/Grid';
import { DagTableComponent } from '../DagTableComponent';
import { StatusComponent } from '../StatusComponent';
import { VersionComponent } from '../VersionComponent';

export const HomePage = () => (
  <>
    <Header
      title="Apache Airflow"
      description="Workflow management platform"
      metadata={[{ label: 'Lifecycle', value: 'Alpha' }]}
    />
    <Container>
      <Flex justify="between" align="center" mb="4">
        <Text as="h2" variant="title-medium">
          Overview
        </Text>
        <SupportButton>
          See an overview of your Apache Airflow instance, and manage workflows
        </SupportButton>
      </Flex>
      <Grid container spacing={3} direction="row">
        <Grid item sm={12} lg={6}>
          <VersionComponent />
        </Grid>
        <Grid item sm={12} lg={6}>
          <StatusComponent />
        </Grid>
        <Grid item sm={12}>
          <DagTableComponent />
        </Grid>
      </Grid>
    </Container>
  </>
);
