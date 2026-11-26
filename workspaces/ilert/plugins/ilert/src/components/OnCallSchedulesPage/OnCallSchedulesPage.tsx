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
import { AuthenticationError } from '@backstage/errors';
import { OnCallSchedulesGrid } from './OnCallSchedulesGrid';
import { MissingAuthorizationHeaderError } from '../Errors';
import { useOnCallSchedules } from '../../hooks/useOnCallSchedules';
import { SupportButton, ResponseErrorPanel } from '@backstage/core-components';
import { Container, Flex, Text } from '@backstage/ui';

export const OnCallSchedulesPage = () => {
  const [{ onCallSchedules, isLoading, error }, { refetchOnCallSchedules }] =
    useOnCallSchedules();

  if (error) {
    if (error instanceof AuthenticationError) {
      return (
        <Container>
          <MissingAuthorizationHeaderError />
        </Container>
      );
    }

    return (
      <Container>
        <ResponseErrorPanel error={error} />
      </Container>
    );
  }

  return (
    <Container>
      <Flex justify="between" align="center" mb="4">
        <Text as="h2" variant="title-medium">
          Who is on call?
        </Text>
        <Flex align="center" gap="2">
          <SupportButton>
            This helps you to bring ilert into your developer portal.
          </SupportButton>
        </Flex>
      </Flex>
      <OnCallSchedulesGrid
        onCallSchedules={onCallSchedules}
        isLoading={isLoading}
        refetchOnCallSchedules={refetchOnCallSchedules}
      />
    </Container>
  );
};
