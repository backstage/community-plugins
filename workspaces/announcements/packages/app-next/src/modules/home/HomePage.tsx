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
// HomePage for app-next replicating legacy Home announcements showcase
import { AnnouncementsCard } from '@backstage-community/plugin-announcements';
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Header,
  Link,
  Text,
} from '@backstage/ui';
import styles from './HomePage.module.css';

export const HomePage = () => {
  return (
    <>
      <Header
        title="Announcements Plugin Showcase"
        description="Demonstrates the primary UI surfaces of the announcements plugin and provides quick navigation to administration areas. Use it as a reference when embedding Announcements into your Backstage instance."
      />
      <Container>
        <Flex direction="column" gap="6">
          {/* Intro / Quick Links */}
          <Card>
            <CardHeader>
              <Text as="h2" variant="title-small">
                Quick Links
              </Text>
            </CardHeader>
            <CardBody>
              <Flex gap="4">
                <Link href="/announcements">All Announcements</Link>
                <Link href="/announcements/admin">Admin Portal</Link>
                <Link href="/announcements/admin/categories">Categories</Link>
                <Link href="/announcements/admin/tags">Tags</Link>
              </Flex>
            </CardBody>
          </Card>

          {/* Live Components Showcase */}
          <Text as="h2" variant="title-small">
            Live Components
          </Text>
          <Card>
            <CardHeader>
              <Text as="h3" variant="title-x-small">
                Announcements Banner
              </Text>
            </CardHeader>
            <CardBody>
              <Flex direction="column" gap="2">
                <Text as="p" variant="body-medium">
                  The banner now renders globally via the new frontend system.
                  Adjust its behavior through the{' '}
                  <Text className={styles.code}>app.extensions</Text> config
                  using the{' '}
                  <Text className={styles.code}>announcements/banner</Text> key.
                </Text>
                <Text variant="body-medium" color="secondary">
                  Example:
                </Text>
                <Text as="div" variant="body-medium" className={styles.pre}>
                  {`app:
  extensions:
    - announcements/banner:
        config:
          variant: floating
          max: 2
          tags: ['kubernetes']`}
                </Text>
              </Flex>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Text as="h3" variant="title-x-small">
                Announcements Card
              </Text>
            </CardHeader>
            <CardBody>
              <Flex direction="column" gap="2">
                <Text as="p" variant="body-medium">
                  A compact overview suitable for dashboards or entity pages.
                  You can tweak size and filtering in the future roadmap.
                </Text>
                <AnnouncementsCard max={2} />
              </Flex>
            </CardBody>
          </Card>
        </Flex>
      </Container>
    </>
  );
};
