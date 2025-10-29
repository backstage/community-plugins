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

import { Entity } from '@backstage/catalog-model';
import { Route, Routes } from 'react-router';
import PullRequestList from './PullRequestList';
import { BITBUCKET_PULL_REQUESTS_ANNOTATION } from '../utils/isBitbucketSlugSet';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';

export const isBitbucketPullRequestsAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[BITBUCKET_PULL_REQUESTS_ANNOTATION]);

export const Router = () => {
  const { entity } = useEntity();
  return !isBitbucketPullRequestsAvailable(entity) ? (
    <MissingAnnotationEmptyState
      annotation={BITBUCKET_PULL_REQUESTS_ANNOTATION}
    />
  ) : (
    <Routes>
      <Route path="/" element={<PullRequestList />} />
    </Routes>
  );
};
