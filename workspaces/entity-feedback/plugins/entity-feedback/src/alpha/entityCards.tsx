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

import { InfoCard } from '@backstage/core-components';
import { compatWrapper } from '@backstage/core-compat-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useAsyncEntity } from '@backstage/plugin-catalog-react';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  entityFeedbackAllPredicate,
  entityFeedbackOwnerPredicate,
} from './entityPredicates';

/**
 * @alpha
 */
export const entityRatingsButtonsCard = EntityCardBlueprint.makeWithOverrides({
  name: 'ratings-buttons',
  config: {
    schema: {
      title: z => z.string().default('Rate this entity'),
      variant: z => z.enum(['like-dislike', 'starred']).default('like-dislike'),
      requestResponse: z => z.boolean().optional(),
      dialogTitle: z => z.string().optional(),
      dialogResponses: z =>
        z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
            }),
          )
          .optional(),
    },
  },
  factory(originalFactory, { config }) {
    const { variant, title, requestResponse, dialogTitle, dialogResponses } =
      config;
    return originalFactory({
      filter: entityFeedbackAllPredicate,
      async loader() {
        const { LikeDislikeButtons } = await import(
          '../components/LikeDislikeButtons'
        );
        const { StarredRatingButtons } = await import(
          '../components/StarredRatingButtons'
        );
        const Buttons =
          variant === 'like-dislike'
            ? LikeDislikeButtons
            : StarredRatingButtons;
        return compatWrapper(
          <InfoCard title={title}>
            <Buttons
              requestResponse={requestResponse}
              feedbackDialogTitle={dialogTitle}
              feedbackDialogResponses={dialogResponses}
            />
          </InfoCard>,
        );
      },
    });
  },
});

/**
 * @alpha
 */
export const entityRatingsTableCard = EntityCardBlueprint.makeWithOverrides({
  name: 'ratings-table',
  config: {
    schema: {
      title: z => z.string().optional(),
      allEntities: z => z.boolean().optional(),
      variant: z => z.enum(['like-dislike', 'starred']).default('like-dislike'),
    },
  },
  factory(originalFactory, { config }) {
    const { variant, title, allEntities } = config;
    return originalFactory({
      filter: entityFeedbackOwnerPredicate,
      async loader() {
        const { LikeDislikeRatingsTable } = await import(
          '../components/LikeDislikeRatingsTable'
        );
        const { StarredRatingsTable } = await import(
          '../components/StarredRatingsTable'
        );
        const Table =
          variant === 'like-dislike'
            ? LikeDislikeRatingsTable
            : StarredRatingsTable;
        function Component() {
          const { entity } = useAsyncEntity();
          const ownerRef = entity ? stringifyEntityRef(entity) : '';
          return (
            <Table
              title={title}
              allEntities={allEntities}
              ownerRef={ownerRef}
            />
          );
        }
        return compatWrapper(<Component />);
      },
    });
  },
});
