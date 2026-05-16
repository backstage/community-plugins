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

import { Card, CardHeader, CardBody, Box, Flex, Text } from '@backstage/ui';

import { Setting } from '../types';

/**
 * @internal
 */
export function SettingsCard({ setting }: { setting: Setting }) {
  return (
    <Card>
      <CardHeader>
        <Flex justify="between">
          <Flex direction="column" gap="0">
            <Text variant="title-small">{setting.title}</Text>
            {setting.subtitle && (
              <Text variant="body-small">{setting.subtitle}</Text>
            )}
          </Flex>
          <Box>{setting.action}</Box>
        </Flex>
      </CardHeader>
      <CardBody>{setting.element}</CardBody>
    </Card>
  );
}
