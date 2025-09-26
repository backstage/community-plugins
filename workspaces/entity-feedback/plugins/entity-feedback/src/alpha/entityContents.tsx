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

import { stringifyEntityRef } from '@backstage/catalog-model';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../routes';
import { entityFeedbackAllPredicate } from './entityPredicates';

/**
 * @alpha
 */
export const entityFeedbackEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/feedback',
    title: 'Feedback',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    filter: entityFeedbackAllPredicate,
    async loader() {
      const { FeedbackResponseTable } = await import(
        '../components/FeedbackResponseTable'
      );
      function Component() {
        const { entity } = useAsyncEntity();
        return (
          <FeedbackResponseTable
            entityRef={entity ? stringifyEntityRef(entity) : ''}
          />
        );
      }
      return compatWrapper(<Component />);
    },
  },
});
