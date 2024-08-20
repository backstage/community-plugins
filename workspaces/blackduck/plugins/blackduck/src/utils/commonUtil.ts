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
  projectName: string;
  projectVersion: string;
} => {
  let projectName = undefined;
  let projectVersion = undefined;
  const annotation: any =
    entity?.metadata.annotations?.[BLACKDUCK_PROJECT_ANNOTATION];
  if (annotation) {
    [projectName, projectVersion] = annotation.split('/');
  }
  return { projectName, projectVersion };
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
