/*
 * Copyright 2023 The Backstage Authors
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
  OCTOPUS_DEPLOY_PROJECT_ID_ANNOTATION,
  OCTOPUS_DEPLOY_PROJECT_SLUG_ANNOTATION,
} from '../constants';

/** @public */
export type ProjectReference =
  | { projectId: string; projectSlug?: never; spaceId?: string }
  | { projectSlug: string; projectId?: never; spaceId?: string };

export function getProjectReferenceAnnotationFromEntity(
  entity: Entity,
): ProjectReference {
  const annotations = entity.metadata.annotations;
  const projectIdAnnotation = annotations?.[OCTOPUS_DEPLOY_PROJECT_ID_ANNOTATION];
  const projectSlugAnnotation =
    annotations?.[OCTOPUS_DEPLOY_PROJECT_SLUG_ANNOTATION];

  if (projectIdAnnotation) {
    return parseProjectReference(projectIdAnnotation, 'projectId');
  }

  if (projectSlugAnnotation) {
    return parseProjectReference(projectSlugAnnotation, 'projectSlug');
  }

  throw new Error(
    `Value for annotation ${OCTOPUS_DEPLOY_PROJECT_ID_ANNOTATION} or ${OCTOPUS_DEPLOY_PROJECT_SLUG_ANNOTATION} was not found`,
  );
}

function parseProjectReference(
  annotation: string,
  referenceType: 'projectId' | 'projectSlug',
): ProjectReference {
  const referencedProject = annotation.split('/', 2);
  const spaceId =
    referencedProject.length === 2 ? referencedProject[0] : undefined;
  const projectIdentifier =
    referencedProject.length === 2 ? referencedProject[1] : referencedProject[0];

  if (referenceType === 'projectId') {
    return spaceId
      ? { projectId: projectIdentifier, spaceId }
      : { projectId: projectIdentifier };
  }

  return spaceId
    ? { projectSlug: projectIdentifier, spaceId }
    : { projectSlug: projectIdentifier };
}
