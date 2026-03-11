/*
 * Copyright 2025 The Backstage Authors
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
import { Entity } from '@backstage/catalog-model';
import { Box, Text } from '@backstage/ui';
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';

export const EmptyBuildResults = ({ entity }: { entity?: Entity }) => {
  const annotations = entity
    ? getAnnotationValuesFromEntity(entity)
    : undefined;
  const repoName = annotations?.repo;
  const buildDefinition = annotations?.definition;

  return (
    <Box p="4" style={{ textAlign: 'center' }}>
      <Text as="p" variant="body-large">
        No records to display
      </Text>
      <Text as="p" variant="body-medium">
        No builds could be found with repository name{' '}
        {repoName ?? '(no value provided)'} or build definition{' '}
        {buildDefinition ?? '(no value provided)'}.
      </Text>
    </Box>
  );
};
