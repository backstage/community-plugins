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
import { Route, Routes } from 'react-router-dom';

import { Entity } from '@backstage/catalog-model';

import { QUAY_ANNOTATION_REPOSITORY } from '../hooks';
import { tagRouteRef } from '../routes';
import { QuayRepository } from './QuayRepository';
import { QuayTagPage } from './QuayTagPage';

/** *
 * @public
 */
export const isQuayAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[QUAY_ANNOTATION_REPOSITORY]);
/**
 *
 * @public
 */
export const Router = () => (
  <Routes>
    <Route path="/" element={<QuayRepository />} />
    <Route path={tagRouteRef.path} element={<QuayTagPage />} />
  </Routes>
);
