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

import { Box, Card, CardHeader, CardBody, Flex, Text } from '@backstage/ui';

/** @public */
export interface CardWidgetProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  content: React.ReactNode;
}

/** @public */
export function CardWidget(props: CardWidgetProps) {
  return (
    <Card style={{ height: '100%' }}>
      {(props.title || props.subtitle || props.action) && (
        <CardHeader>
          <Flex justify="between">
            <Flex direction="column" gap="0">
              {props.title && (
                <Text variant="title-x-small">{props.title}</Text>
              )}
              {props.subtitle && (
                <Text variant="body-small" color="secondary">
                  {props.subtitle}
                </Text>
              )}
            </Flex>
            <Box>{props.action}</Box>
          </Flex>
        </CardHeader>
      )}
      <CardBody>{props.content}</CardBody>
    </Card>
  );
}
