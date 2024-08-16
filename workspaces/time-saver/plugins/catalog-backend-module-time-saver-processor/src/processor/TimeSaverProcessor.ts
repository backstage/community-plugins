import { LoggerService } from '@backstage/backend-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { JsonValue } from '@backstage/types';

type Substitute = {
  engineering: Record<string, number>;
};

function isValidSubstitute(
  substitute: JsonValue | undefined,
): substitute is Substitute {
  return (
    typeof substitute === 'object' &&
    !Array.isArray(substitute) &&
    substitute !== null &&
    substitute !== undefined &&
    substitute.engineering !== undefined
  );
}

export class TimeSaverProcessor implements CatalogProcessor {
  #TimeSaved = 'backstage.io/time-saved';

  constructor(private readonly logger: LoggerService) {}

  getProcessorName() {
    return 'TimeSaverProcessor';
  }

  async preProcessEntity(entity: Entity) {
    // Ignore non-templates
    if (entity.kind !== 'Template') {
      return entity;
    }

    // Ignore any templates that already have backstage.io/time-saved metadata
    if (entity.metadata.annotations?.[this.#TimeSaved]) {
      return entity;
    }

    // Ignore templates that do not have substitute timing defined.
    const { substitute } = entity.metadata;
    if (!isValidSubstitute(substitute)) {
      return entity;
    }

    // Calculate hours saved and set on standard annotation.
    const hoursSaved = Object.values(substitute.engineering).reduce(
      (total, hours) => total + hours,
      0,
    );
    if (hoursSaved > 0) {
      entity.metadata.annotations = {
        ...entity.metadata.annotations,
        [this.#TimeSaved]: `PT${hoursSaved}H`,
      };
    }
    this.logger.debug(
      `Template Entity ${entity.metadata.name} has time-saved annotation ${hoursSaved}`,
    );

    return entity;
  }
}
