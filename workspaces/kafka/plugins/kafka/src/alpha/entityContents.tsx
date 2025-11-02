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
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootCatalogKafkaRouteRef } from '../plugin';
import { KAFKA_CONSUMER_GROUP_ANNOTATION } from '../constants';

/**
 * @alpha
 */
export const kafkaEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/kafka',
    title: 'Kafka',
    routeRef: convertLegacyRouteRef(rootCatalogKafkaRouteRef),
    filter: {
      [`metadata.annotations.${KAFKA_CONSUMER_GROUP_ANNOTATION}`]: {
        $exists: true,
      },
    },
    loader: async () =>
      import('../Router').then(m => compatWrapper(<m.Router />)),
  },
});
