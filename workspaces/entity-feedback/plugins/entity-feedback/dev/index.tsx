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
import React from 'react';

import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';

import {
  entityFeedbackPlugin,
  EntityFeedbackResponseContent,
} from '../src/plugin';
import { Ratings } from '@backstage-community/plugin-entity-feedback-common';
import { LikeDislikeButtons } from '../src';
import { Content, Header, HeaderLabel, Page } from '@backstage/core-components';
import { entityFeedbackApiRef } from '../src/api';

const entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'random-name',
  },
} as Entity;

createDevApp()
  .registerPlugin(entityFeedbackPlugin)
  .registerApi({
    api: entityFeedbackApiRef,
    deps: {},
    factory: () => ({
      getResponses: async () => [],
      getAllRatings: async () => [],
      getOwnedRatings: async () => [],
      recordRating: async () => {},
      getRatings: async () => [],
      getRatingAggregates: async (): Promise<Ratings> => ({}), // Change the return type and provide an empty object
      recordResponse: async () => {}, // Add this line
    }),
  })
  .addPage({
    title: 'Feedback',
    element: (
      <EntityProvider entity={entity}>
        <Page themeId="service">
          <Header title="Feedback Entity">
            <HeaderLabel label="Mode" value="Development" />
          </Header>
          <Content>
            <LikeDislikeButtons />
            <EntityFeedbackResponseContent />
          </Content>
        </Page>
      </EntityProvider>
    ),
  })
  .render();
