import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { ErrorApi, errorApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
  EntityLayout,
} from '@backstage/plugin-catalog';

import { entityFeedbackPlugin, FeedbackResponseTable } from '../src/plugin';
import { Ratings } from '@backstage-community/plugin-entity-feedback-common';
import { LikeDislikeButtons } from '../src';
import { Content, Header, HeaderLabel, Page } from '@backstage/core-components';
import { EntityFeedbackApi, entityFeedbackApiRef } from '../src/api';

const entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'random-name',
  },
};

const feedbackApi: Partial<EntityFeedbackApi> = {
  getResponses: async () => [
    {
      userRef: 'user:test',
      comments:
        '{"responseComments":{"incorrect":"incorrect link","missing":"missing contact"},"additionalComments":"some comment"}',
      consent: true,
      response: 'incorrect,missing',
    },
  ],
  getAllRatings: async () => [],
  getOwnedRatings: async () => [],
  recordRating: async () => {},
  getRatings: async () => [],
  getRatingAggregates: async (): Promise<Ratings> => ({}),
  recordResponse: async () => {},
};
const errorApi: Partial<ErrorApi> = { post: () => {} };

createDevApp()
  .registerPlugin(entityFeedbackPlugin)
  .registerPlugin(catalogPlugin)
  .registerApi({
    api: entityFeedbackApiRef,
    deps: {},
    factory: () => ({
      getResponses: async () => [],
      getAllRatings: async () => [],
      getOwnedRatings: async () => [],
      recordRating: async () => {},
      getRatings: async () => [],
      getRatingAggregates: async (): Promise<Ratings> => ({}),
      recordResponse: async () => {},
    }),
  })
  .addPage({
    title: 'Feedback',
    path: '/feedback',
    element: (
      <TestApiProvider
        apis={[
          [entityFeedbackApiRef, feedbackApi],
          [errorApiRef, errorApi],
        ]}
      >
        <EntityProvider entity={entity}>
          <Page themeId="service">
            <Header title="Feedback Entity">
              <HeaderLabel label="Mode" value="Development" />
            </Header>
            <Content>
              <LikeDislikeButtons />
              <FeedbackResponseTable entityRef="component:default/test" />
            </Content>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
  })
  .addPage({
    path: '/catalog',
    title: 'Catalog',
    element: <CatalogIndexPage />,
  })
  .addPage({
    path: '/catalog/:namespace/:kind/:name',
    element: <CatalogEntityPage />,
    children: (
      <EntityProvider entity={entity}>
        <EntityLayout>
          <EntityLayout.Route path="/" title="Overview">
            <h1>Overview</h1>
          </EntityLayout.Route>
        </EntityLayout>
      </EntityProvider>
    ),
  })
  .render();
