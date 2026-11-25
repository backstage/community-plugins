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

import Grid from '@material-ui/core/Grid';
import NewRelicFetchComponent from '../NewRelicFetchComponent';
import { SupportButton } from '@backstage/core-components';
import { Container, Flex, Header, Text } from '@backstage/ui';

export const NewRelicComponent = () => (
  <>
    <Header
      title="New Relic"
      metadata={[{ label: 'Owner', value: 'Engineering' }]}
    />
    <Container>
      <Flex justify="between" align="center" mb="4">
        <Text as="h2" variant="title-medium">
          New Relic
        </Text>
        <SupportButton>
          New Relic Application Performance Monitoring
        </SupportButton>
      </Flex>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <NewRelicFetchComponent />
        </Grid>
      </Grid>
    </Container>
  </>
);
