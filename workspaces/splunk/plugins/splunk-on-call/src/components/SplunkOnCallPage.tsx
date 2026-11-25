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
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { EntitySplunkOnCallCard } from './EntitySplunkOnCallCard';
import { SupportButton } from '@backstage/core-components';
import { Container, Flex, Header, Text } from '@backstage/ui';

const useStyles = makeStyles(() => ({
  overflowXScroll: {
    overflowX: 'scroll',
  },
}));

/** @public */
export type SplunkOnCallPageProps = {
  title?: string;
  subtitle?: string;
  pageTitle?: string;
};

export const SplunkOnCallPage = (props: SplunkOnCallPageProps): JSX.Element => {
  const { title, subtitle, pageTitle } = props;
  const classes = useStyles();

  return (
    <>
      <Header title={title} description={subtitle} />
      <Container className={classes.overflowXScroll}>
        <Flex justify="between" align="center" mb="4">
          <Text as="h2" variant="title-medium">
            {pageTitle}
          </Text>
          <SupportButton>
            This is used to help you automate incident management.
          </SupportButton>
        </Flex>
        <Grid container spacing={3} direction="row">
          <Grid item xs={12} sm={6} md={4}>
            <EntitySplunkOnCallCard />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

SplunkOnCallPage.defaultProps = {
  title: 'Splunk On-Call',
  subtitle: 'Automate incident management',
  pageTitle: 'Dashboard',
};
