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
import { Entity } from '@backstage/catalog-model';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';

import { Card, CardHeader } from '@material-ui/core';

import { QUAY_ANNOTATION_REPOSITORY } from '../../hooks';
import { isQuayAvailable } from '../../plugin';
import { QuayRepository } from '../QuayRepository';

const Widget = () => {
  return (
    <Card>
      <CardHeader title="Docker Image" />
      <QuayRepository />
    </Card>
  );
};

export const QuayWidget = () => {
  const { entity } = useEntity();

  return !isQuayAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={QUAY_ANNOTATION_REPOSITORY} />
  ) : (
    <Widget />
  );
};

export const QuayWidgetEntity = ({ entity }: { entity: Entity }) => {
  return !isQuayAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={QUAY_ANNOTATION_REPOSITORY} />
  ) : (
    <Widget />
  );
};
