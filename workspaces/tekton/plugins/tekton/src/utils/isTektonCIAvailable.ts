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

import { TektonAnnotations } from '@backstage-community/plugin-tekton-common';

/** @deprecated */
const DEPRECATED_JANUS_IDP_ANNOTATION = 'janus-idp.io/tekton';

/**
 * Returns true if the entity supports the Tekton CI/CD feature and
 * the Tekton CI/CD card should be shown on the CI/CD tab.
 *
 * This means that the catalog entity has one of this annotations set:
 *
 * 1. `tekton.dev/ci-cd: "true"` or
 * 2. `janus-idp.io/tekton` is defined (any value is accepted).
 *
 * @public
 */
export const isTektonCIAvailable = (entity: Entity): boolean =>
  entity.metadata.annotations?.[TektonAnnotations.CICD] === 'true' ||
  Boolean(entity.metadata.annotations?.[DEPRECATED_JANUS_IDP_ANNOTATION]);
