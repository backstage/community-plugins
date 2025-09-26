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

import { EntityFeedbackApi } from '../../src';

export const feedbackApiMock: EntityFeedbackApi = {
  getResponses: async () => [
    {
      userRef: 'user:guest',
      comments:
        '{"responseComments":{"incorrect":"incorrect link","missing":"missing contact"},"additionalComments":"some comment"}',
      consent: true,
      response: 'incorrect,missing',
    },
  ],
  getAllRatings: async () => [
    {
      entityRef: 'component:default/random-name',
      entityTitle: 'Random Name',
      ratings: { LIKE: 3, DISLIKE: 0 },
    },
    {
      entityRef: 'component:default/foo',
      entityTitle: 'Foo',
      ratings: { LIKE: 1, DISLIKE: 0 },
    },
    {
      entityRef: 'component:default/bar',
      entityTitle: 'Bar',
      ratings: { LIKE: 0, DISLIKE: 1 },
    },
  ],
  getOwnedRatings: async () => [
    {
      entityRef: 'component:default/random-name',
      entityTitle: 'Random Name',
      ratings: { LIKE: 3, DISLIKE: 0 },
    },
  ],
  recordRating: async () => {},
  getRatings: async () => [
    { userRef: 'user:default/random-name', rating: 'LIKE' },
  ],
  getRatingAggregates: async () => ({ LIKE: 4, DISLIKE: 1 }),
  recordResponse: async () => {},
};
