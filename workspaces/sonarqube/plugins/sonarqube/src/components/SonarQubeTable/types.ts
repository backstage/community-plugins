/*
 * Copyright 2024 The Backstage Authors
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
import { FindingSummary } from '@backstage-community/plugin-sonarqube-react';

export interface SonarQubeTableRow {
  resolved: {
    name: string;
    isSonarQubeAnnotationEnabled?: boolean;
    findings?: FindingSummary;
  };
  id: string;
}

export interface EntityLinkProps {
  entityRef: string;
  title: string;
  url: string;
  kind: string;
  namespace: string;
}

/** @public */
export type DuplicationRating = {
  greaterThan: number;
  rating: '1.0' | '2.0' | '3.0' | '4.0' | '5.0';
};

export const defaultDuplicationRatings: DuplicationRating[] = [
  { greaterThan: 0, rating: '1.0' },
  { greaterThan: 3, rating: '2.0' },
  { greaterThan: 5, rating: '3.0' },
  { greaterThan: 10, rating: '4.0' },
  { greaterThan: 20, rating: '5.0' },
];
