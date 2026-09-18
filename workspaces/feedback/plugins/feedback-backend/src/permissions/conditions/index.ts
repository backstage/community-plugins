/*
 * Copyright 2026 The Backstage Authors
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

import { createConditionExports } from '@backstage/plugin-permission-node';
import { feedbackResourceRef } from '../resources/feedback';
import { isFeedbackOwner } from '../rules/isFeedbackOwner';

const { conditions, createConditionalDecision } = createConditionExports({
  resourceRef: feedbackResourceRef,
  rules: { isFeedbackOwner },
});

/**
 * Rules/conditions that can be used to authorize access to feedback resources.
 *
 * @public
 */
export const feedbackConditions = conditions;

/**
 * Helper to construct a conditional decision for the feedback resource based on permission criteria.
 *
 * @public
 */
export const createFeedbackConditionalDecision = createConditionalDecision;
