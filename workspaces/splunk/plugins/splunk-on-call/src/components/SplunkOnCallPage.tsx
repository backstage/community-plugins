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

import { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Content,
  ContentHeader,
  Page,
  Header,
  SupportButton,
  EmptyState,
} from '@backstage/core-components';
import { Box, Button, Flex } from '@backstage/ui';
import styles from './SplunkOnCallPage.module.css';

/** @public */
export type SplunkOnCallPageProps = {
  title?: string;
  subtitle?: string;
  pageTitle?: string;
};

export const SplunkOnCallPage = (props: SplunkOnCallPageProps): JSX.Element => {
  const { title, subtitle, pageTitle } = props;
  const navigate = useNavigate();

  const handleNavigateToCatalog = () => {
    navigate('/catalog');
  };

  return (
    <Page themeId="tool">
      <Header title={title} subtitle={subtitle} />
      <Content className={styles.overflowXScroll}>
        <ContentHeader title={pageTitle}>
          <SupportButton>
            This is used to help you automate incident management.
          </SupportButton>
        </ContentHeader>
        <Box className={styles.container}>
          <Box className={styles.cardWrapper}>
            <Flex direction="column" className={styles.cardContent}>
              <EmptyState
                title="View Splunk On-Call from an Entity"
                missing="data"
                description="The Splunk On-Call card is designed to be used as a catalog entity card. Please navigate to an entity in the catalog that has the Splunk On-Call annotations configured."
                action={
                  <Button variant="primary" onClick={handleNavigateToCatalog}>
                    Go to Catalog
                  </Button>
                }
              />
            </Flex>
          </Box>
        </Box>
      </Content>
    </Page>
  );
};

SplunkOnCallPage.defaultProps = {
  title: 'Splunk On-Call',
  subtitle: 'Automate incident management',
  pageTitle: 'Dashboard',
};
