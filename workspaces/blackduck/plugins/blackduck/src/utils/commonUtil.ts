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
import { BLACKDUCK_PROJECT_ANNOTATION } from '@backstage-community/plugin-blackduck-common';

/**
 * @public
 */
export const isBlackDuckAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[BLACKDUCK_PROJECT_ANNOTATION]);

export const getProjectAnnotation = (
  entity: Entity,
): {
  hostKey: string;
  projectName: string;
  projectVersion: string;
} => {
  const annotation: string | undefined =
    entity?.metadata.annotations?.[BLACKDUCK_PROJECT_ANNOTATION];

  if (!annotation) {
    throw new Error('Annotation is missing.');
  }

  const splitAnnotation = annotation.split('/');

  if (splitAnnotation.length === 2) {
    const [projectName, projectVersion] = splitAnnotation;
    return { hostKey: 'default', projectName, projectVersion };
  } else if (splitAnnotation.length === 3) {
    const [hostKey, projectName, projectVersion] = splitAnnotation;
    return { hostKey, projectName, projectVersion };
  }

  throw new Error(
    "Invalid annotation format: Must be either 'projectName/projectVersion' or 'hostKey/projectName/projectVersion'.",
  );
};

// Filter out the OK and UNKNOWN keys from the risk profile
export const filteredRiskProfile = (riskProfile: any): any => {
  const filtered: any = {};
  Object.keys(riskProfile).filter(key => {
    if (key !== 'OK' && key !== 'UNKNOWN') {
      filtered[key] = riskProfile[key];
    }
  });
  return filtered;
};
