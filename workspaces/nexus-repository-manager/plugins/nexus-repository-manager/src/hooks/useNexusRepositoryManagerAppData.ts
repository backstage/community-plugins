import { type Entity } from '@backstage/catalog-model';

import { NEXUS_REPOSITORY_MANAGER_CONFIG_ANNOTATIONS } from '../annotations';
import { Annotation, type SearchServiceQuery } from '../types';

type UseNexusRepositoryManagerAppDataArgs = {
  entity: Entity;
  ANNOTATIONS: Readonly<Annotation[]>;
};

export const useNexusRepositoryManagerAppData = ({
  entity,
  ANNOTATIONS,
}: UseNexusRepositoryManagerAppDataArgs): {
  title: string;
  query: SearchServiceQuery;
} => {
  const value = ANNOTATIONS.reduce(
    (acc, v) => {
      const repository = entity?.metadata.annotations?.[v.annotation];

      if (!repository) {
        return acc;
      }

      acc.repositories.push(repository);
      const query = v.query
        ? Object.assign(acc.query ?? {}, v.query(repository), {
            sort: 'version',
          })
        : acc.query;

      return {
        ...acc,
        query,
      };
    },
    { repositories: [], query: {} } as {
      repositories: string[];
      query: SearchServiceQuery;
    },
  );

  if (value.repositories.length === 0) {
    throw new Error(`A Nexus Repository Manager annotation could not be found`);
  }

  let title: string | undefined;
  NEXUS_REPOSITORY_MANAGER_CONFIG_ANNOTATIONS.forEach(v => {
    switch (v.annotation /* NOSONAR - use switch for exhaustive check */) {
      case 'nexus-repository-manager/config.title':
        title = entity?.metadata.annotations?.[v.annotation];
        break;
      default:
        // We want to throw a TS error if we have an unhandled annotation
        // eslint-disable-next-line no-case-declarations
        const exhaustiveCheck: never = v.annotation;
        throw new Error(`Unhandled annotation case: ${exhaustiveCheck}`);
    }
  });

  return {
    title: title ?? value.repositories.join(' | '),
    query: value.query,
  };
};
