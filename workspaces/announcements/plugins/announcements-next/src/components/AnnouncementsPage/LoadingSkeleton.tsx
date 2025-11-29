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
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Grid,
  Skeleton,
} from '@backstage/ui';

export function LoadingSkeleton() {
  return (
    <Grid.Root>
      {[1, 2, 3].map(i => (
        <Grid.Item key={i}>
          <Card key={i}>
            <CardHeader>
              <Flex direction="column" gap="2">
                <Skeleton width={120} height={20} />
                <Skeleton width={240} height={24} />
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex direction="column" gap="2">
                <Skeleton width={280} height={16} />
                <Skeleton width={260} height={16} />
                <Skeleton width={180} height={16} />
              </Flex>
            </CardBody>
            <CardFooter>
              <Flex justify="between" style={{ width: '100%' }}>
                <Skeleton width={32} height={32} rounded />
                <Skeleton width={80} height={32} />
              </Flex>
            </CardFooter>
          </Card>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
}
