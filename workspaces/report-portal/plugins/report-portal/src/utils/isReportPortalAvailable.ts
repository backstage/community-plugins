import { Entity } from '@backstage/catalog-model';

/**
 * Checks if ReportPortal annotation is available for a given entity.
 *
 * @param entity - The entity to check for ReportPortal availability.
 * @returns A boolean indicating whether ReportPortal is available.
 *
 * @public
 */
export const isReportPortalAvailable = (entity: Entity): boolean => {
  return Boolean(
    entity.metadata.annotations?.['reportportal.io/project-name'] &&
      entity.metadata.annotations?.['reportportal.io/launch-name'],
  );
};
